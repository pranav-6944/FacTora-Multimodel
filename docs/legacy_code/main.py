import sqlite3
import os
import csv
import io
import asyncio
from datetime import datetime, timedelta
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Form, Depends, HTTPException, status, BackgroundTasks
from fastapi.responses import HTMLResponse, RedirectResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import httpx
from werkzeug.security import generate_password_hash, check_password_hash

# Core module imports
import sys
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if os.path.join(BASE_DIR, 'core') not in sys.path:
    sys.path.append(os.path.join(BASE_DIR, 'core'))

from config import DB_DIR, MODEL_DIR, AUTH_DB, FEEDBACK_DB, TRUTH_DB, MODEL_FILE, VECTORIZER_FILE
from predict_bert import predict_news
from credibility_engine import compute_credibility
from source_verifier import verify_source

load_dotenv()

app = FastAPI(title="FacTora API")

# Add Session Middleware for Flash Messages and Auth
app.add_middleware(
    SessionMiddleware,
    secret_key=os.environ.get('SECRET_KEY', 'dev-fallback-key-change-in-production')
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")
templates.env.globals['config'] = {}

# Mock User class for templates
class User:
    def __init__(self, id, username):
        self.id = id
        self.username = username
        self.is_authenticated = True

from typing import Optional

# Dependency to get current user from session
async def get_current_user(request: Request) -> Optional[User]:
    user_id = request.session.get('user_id')
    username = request.session.get('username')
    if user_id and username:
        return User(user_id, username)
    return None

async def get_current_user_required(request: Request) -> User:
    user = await get_current_user(request)
    if not user:
        request.session.setdefault('flashes', []).append(('error', 'Please log in to access this page.'))
        raise HTTPException(
            status_code=status.HTTP_307_TEMPORARY_REDIRECT,
            headers={"Location": "/login"}
        )
    return user

def custom_template_response(request: Request, name: str, context: dict):
    context['request'] = request
    # Custom url_for shim for Flask compatibility
    def custom_url_for(endpoint, **kwargs):
        if endpoint == 'static':
            path = kwargs.pop('filename', '')
            kwargs.pop('_external', None)
            return request.url_for('static', path=path)
            
        from starlette.routing import NoMatchFound
        try:
            return request.url_for(endpoint, **kwargs)
        except NoMatchFound:
            # Fallback for Flask route names
            mapping = {
                'index': '/',
                'register': '/register',
                'login': '/login',
                'logout': '/logout',
                'dashboard': '/dashboard',
                'history': '/history',
                'help': '/help',
                'settings': '/settings',
                'live_news': '/live-news',
                'source_check': '/source-check',
                'export_csv': '/export-csv',
                'export_history': '/export/history',
                'install_extension': '/install-extension',
                'download_extension': '/download-extension',
                'privacy': '/privacy',
                'terms': '/terms',
                'cookies': '/cookies'
            }
            if endpoint in mapping:
                return mapping[endpoint]
            return f"/{endpoint.replace('_', '-')}"
    context['url_for'] = custom_url_for
    
    # Add flash messages to context
    flashes = request.session.pop('flashes', [])
    def get_flashed_messages(with_categories=False):
        if with_categories:
            return flashes
        return [f[1] for f in flashes]
    context['get_flashed_messages'] = get_flashed_messages
    
    # Add dummy config for Flask compatibility
    class DummyConfig:
        GOOGLE_ANALYTICS_ID = None
        def __getattr__(self, name): return None
        def __getitem__(self, name): return None
    context['config'] = DummyConfig()
    
    # Add current_user to context
    user_id = request.session.get('user_id')
    username = request.session.get('username')
    if user_id:
        context['current_user'] = User(user_id, username)
    else:
        class AnonymousUser:
            is_authenticated = False
            id = None
        context['current_user'] = AnonymousUser()
        
    return templates.TemplateResponse(name, context)

def flash(request: Request, message: str, category: str = "message"):
    request.session.setdefault('flashes', []).append((category, message))

# Database helper function
def get_db(db_name):
    os.makedirs(os.path.dirname(os.path.abspath(db_name)), exist_ok=True)
    db = sqlite3.connect(db_name, timeout=15)
    db.row_factory = sqlite3.Row
    try:
        db.execute('PRAGMA journal_mode=WAL;')
    except Exception:
        pass
    return db

# Initialize databases
def init_db():
    try:
        print("Initializing databases...")
        conn = sqlite3.connect(AUTH_DB)
        conn.execute('''CREATE TABLE IF NOT EXISTS users
                        (id INTEGER PRIMARY KEY AUTOINCREMENT,
                         username TEXT UNIQUE NOT NULL,
                         password_hash TEXT NOT NULL)''')
        conn.commit(); conn.close()
        
        conn = sqlite3.connect(TRUTH_DB)
        conn.execute('''CREATE TABLE IF NOT EXISTS predictions
                        (id INTEGER PRIMARY KEY AUTOINCREMENT,
                         user_id INTEGER NOT NULL,
                         headline TEXT NOT NULL,
                         prediction TEXT NOT NULL,
                         confidence REAL NOT NULL,
                         timestamp TEXT NOT NULL)''')
        conn.commit(); conn.close()
        
        conn = sqlite3.connect(FEEDBACK_DB)
        conn.execute('''CREATE TABLE IF NOT EXISTS feedback
                        (id INTEGER PRIMARY KEY AUTOINCREMENT,
                         prediction_id INTEGER NOT NULL,
                         user_id INTEGER NOT NULL,
                         feedback TEXT NOT NULL,
                         timestamp TEXT NOT NULL)''')
        conn.commit(); conn.close()
        print("Databases initialized")
    except Exception as e:
        print(f"Database initialization error: {e}")

def get_ist_time():
    return datetime.utcnow() + timedelta(hours=5, minutes=30)

@app.on_event("startup")
async def startup_event():
    print("Starting FacTora FastAPI backend...")
    init_db()

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return custom_template_response(request, "index.html", {})

@app.get("/register", response_class=HTMLResponse)
async def register_get(request: Request):
    return custom_template_response(request, "register.html", {})

@app.post("/register")
async def register_post(request: Request, username: str = Form(...), password: str = Form(...)):
    if not username or not password:
        flash(request, 'Username and password are required!', 'error')
        return custom_template_response(request, "register.html", {})
    if len(username) < 3:
        flash(request, 'Username must be at least 3 characters long!', 'error')
        return custom_template_response(request, "register.html", {})
    if len(password) < 6:
        flash(request, 'Password must be at least 6 characters long!', 'error')
        return custom_template_response(request, "register.html", {})
    
    try:
        conn = get_db(AUTH_DB)
        existing = conn.execute('SELECT id FROM users WHERE username = ?', (username,)).fetchone()
        if existing:
            flash(request, 'Username already exists!', 'error')
            conn.close()
            return custom_template_response(request, "register.html", {})
        
        pwd_hash = generate_password_hash(password)
        conn.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', (username, pwd_hash))
        conn.commit()
        conn.close()
        flash(request, 'Registration successful! Please login.', 'success')
        return RedirectResponse(url="/login", status_code=status.HTTP_303_SEE_OTHER)
    except Exception as e:
        flash(request, 'Registration failed. Please try again.', 'error')
        return custom_template_response(request, "register.html", {})

@app.get("/login", response_class=HTMLResponse)
async def login_get(request: Request):
    return custom_template_response(request, "login.html", {})

@app.post("/login")
async def login_post(request: Request, username: str = Form(...), password: str = Form(...)):
    if not username or not password:
        flash(request, 'Username and password are required!', 'error')
        return custom_template_response(request, "login.html", {})
    
    try:
        conn = get_db(AUTH_DB)
        user = conn.execute('SELECT * FROM users WHERE username = ?', (username,)).fetchone()
        conn.close()
        if user and check_password_hash(user['password_hash'], password):
            request.session['user_id'] = user['id']
            request.session['username'] = user['username']
            flash(request, 'Login successful!', 'success')
            return RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)
        else:
            flash(request, 'Invalid username or password!', 'error')
    except Exception as e:
        flash(request, 'Login failed. Please try again.', 'error')
    return custom_template_response(request, "login.html", {})

@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    flash(request, 'You have been logged out.', 'info')
    return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

@app.post("/predict")
async def predict(request: Request, current_user: Optional[User] = Depends(get_current_user)):
    form = await request.form()
    headline = form.get('headline')
    
    if not headline:
        return JSONResponse({'error': 'No headline provided'}, status_code=400)
    headline = headline.strip()
    if len(headline) < 5:
        return JSONResponse({'error': 'Headline too short. Please enter a meaningful headline.'}, status_code=400)
    
    try:
        verdict, confidence = await predict_news(headline)
        result = 'REAL' if verdict == 'REAL' or 'REAL' in str(verdict).upper() else 'FAKE'
        
        prediction_id = None
        if current_user:
            conn = get_db(TRUTH_DB)
            cursor = conn.cursor()
            cursor.execute('''INSERT INTO predictions (user_id, headline, prediction, confidence, timestamp)
                              VALUES (?, ?, ?, ?, ?)''',
                           (current_user.id, headline, result, confidence, get_ist_time().isoformat()))
            prediction_id = cursor.lastrowid
            conn.commit(); conn.close()
            
        return {'result': result, 'confidence': f"{confidence:.2f}%", 'prediction_id': prediction_id}
    except Exception as e:
        return JSONResponse({'error': f'Prediction failed: {str(e)}'}, status_code=500)

@app.post("/feedback")
async def submit_feedback(request: Request, current_user: User = Depends(get_current_user_required)):
    try:
        form = await request.form()
    except Exception:
        return JSONResponse({'error': 'Missing data'}, status_code=400)
        
    prediction_id = form.get('prediction_id')
    feedback = form.get('feedback')
    
    if not prediction_id or not feedback:
        return JSONResponse({'error': 'Missing data'}, status_code=400)
    if feedback not in ['accurate', 'wrong']:
        return JSONResponse({'error': 'Invalid feedback value'}, status_code=400)
        
    try:
        conn = get_db(TRUTH_DB)
        prediction = conn.execute('SELECT id FROM predictions WHERE id = ? AND user_id = ?',
                                (prediction_id, current_user.id)).fetchone()
        conn.close()
        
        if not prediction:
            return JSONResponse({'error': 'Prediction not found'}, status_code=404)
            
        conn = get_db(FEEDBACK_DB)
        existing = conn.execute('SELECT id FROM feedback WHERE prediction_id = ? AND user_id = ?',
                              (prediction_id, current_user.id)).fetchone()
        if existing:
            conn.execute('UPDATE feedback SET feedback = ?, timestamp = ? WHERE prediction_id = ? AND user_id = ?',
                        (feedback, get_ist_time().isoformat(), prediction_id, current_user.id))
        else:
            conn.execute('''INSERT INTO feedback (prediction_id, user_id, feedback, timestamp)
                            VALUES (?, ?, ?, ?)''',
                        (prediction_id, current_user.id, feedback, get_ist_time().isoformat()))
        conn.commit(); conn.close()
        return {'message': 'Feedback submitted successfully'}
    except Exception as e:
        return JSONResponse({'error': f'Failed to submit feedback: {str(e)}'}, status_code=500)

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request, current_user: User = Depends(get_current_user_required)):
    try:
        total_predictions = 0
        accuracy_stats = {'accurate': 0, 'wrong': 0}
        accuracy_percentage = 0
        recent_feedback = []
        
        conn = get_db(TRUTH_DB)
        res = conn.execute('SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', (current_user.id,)).fetchone()
        total_predictions = res['count'] if res else 0
        conn.close()
        
        conn = get_db(FEEDBACK_DB)
        fbs = conn.execute('SELECT feedback, COUNT(*) as count FROM feedback WHERE user_id = ? GROUP BY feedback', (current_user.id,)).fetchall()
        for f in fbs:
            if f['feedback'] in accuracy_stats:
                accuracy_stats[f['feedback']] = f['count']
                
        total_fb = accuracy_stats['accurate'] + accuracy_stats['wrong']
        accuracy_percentage = (accuracy_stats['accurate'] / total_fb * 100) if total_fb > 0 else 0
        
        conn_fb = get_db(FEEDBACK_DB)
        conn_pr = get_db(TRUTH_DB)
        recent_fbs = conn_fb.execute('''SELECT prediction_id, feedback, timestamp 
                                       FROM feedback WHERE user_id = ? 
                                       ORDER BY timestamp DESC LIMIT 5''', (current_user.id,)).fetchall()
        for fb in recent_fbs:
            hl = conn_pr.execute('SELECT headline FROM predictions WHERE id = ?', (fb['prediction_id'],)).fetchone()
            recent_feedback.append({
                'feedback': fb['feedback'],
                'timestamp': fb['timestamp'],
                'headline': hl['headline'] if hl else 'Headline not found'
            })
        conn_fb.close(); conn_pr.close()
        
        return custom_template_response(request, 'dashboard.html', {
            'total_predictions': total_predictions,
            'accuracy_percentage': accuracy_percentage,
            'recent_feedback': recent_feedback,
            'accuracy_stats': accuracy_stats
        })
    except Exception as e:
        flash(request, f'Dashboard error: {str(e)}', 'error')
        return RedirectResponse(url="/", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/history", response_class=HTMLResponse)
async def history(request: Request, page: int = 1, per_page: int = 10, search: str = "", filter_type: str = "all", sort_by: str = "newest", current_user: User = Depends(get_current_user_required)):
    try:
        conn = get_db(TRUTH_DB)
        base_query = 'SELECT * FROM predictions WHERE user_id = ?'
        params = [current_user.id]
        
        if search.strip():
            base_query += ' AND headline LIKE ?'
            params.append(f'%{search.strip()}%')
        if filter_type == 'real':
            base_query += ' AND prediction = ?'
            params.append('REAL')
        elif filter_type == 'fake':
            base_query += ' AND prediction = ?'
            params.append('FAKE')
            
        if sort_by == 'newest': base_query += ' ORDER BY timestamp DESC'
        elif sort_by == 'oldest': base_query += ' ORDER BY timestamp ASC'
        elif sort_by == 'confidence_high': base_query += ' ORDER BY confidence DESC'
        elif sort_by == 'confidence_low': base_query += ' ORDER BY confidence ASC'
        else: base_query += ' ORDER BY timestamp DESC'
        
        all_preds = conn.execute(base_query, params).fetchall()
        total_count = len(all_preds)
        total_pages = (total_count + per_page - 1) // per_page if total_count > 0 else 1
        page = max(1, min(page, total_pages))
        
        offset = (page - 1) * per_page
        paginated_query = base_query + ' LIMIT ? OFFSET ?'
        preds_list = conn.execute(paginated_query, params + [per_page, offset]).fetchall()
        
        total_predictions = conn.execute('SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', (current_user.id,)).fetchone()['count']
        real_count = conn.execute('SELECT COUNT(*) as count FROM predictions WHERE user_id = ? AND prediction = ?', (current_user.id, 'REAL')).fetchone()['count']
        fake_count = conn.execute('SELECT COUNT(*) as count FROM predictions WHERE user_id = ? AND prediction = ?', (current_user.id, 'FAKE')).fetchone()['count']
        conn.close()
        
        predictions_data = []
        for row in preds_list:
            pd = dict(row)
            try: pd['timestamp'] = datetime.fromisoformat(pd['timestamp'])
            except: pd['timestamp'] = datetime.now()
            predictions_data.append(pd)
            
        class PaginationHelper:
            def __init__(self, items, page, per_page, total):
                self.items = items; self.page = page; self.per_page = per_page; self.total = total
                self.pages = (total + per_page - 1) // per_page if total > 0 else 1
                self.has_prev = page > 1; self.has_next = page < self.pages
                self.prev_num = page - 1 if self.has_prev else None
                self.next_num = page + 1 if self.has_next else None
            def iter_pages(self, left_edge=2, left_current=2, right_current=5, right_edge=2):
                last = 0
                for num in range(1, self.pages + 1):
                    if num <= left_edge or (num > self.page - left_current - 1 and num < self.page + right_current) or num > self.pages - right_edge:
                        if last + 1 != num: yield None
                        yield num
                        last = num
                        
        pagination = PaginationHelper(predictions_data, page, per_page, total_count)
        
        return custom_template_response(request, 'history.html', {
            'predictions': pagination, 'total_predictions': total_predictions, 'real_count': real_count,
            'fake_count': fake_count, 'search_query': search, 'filter_type': filter_type, 'sort_by': sort_by, 'per_page': per_page
        })
    except Exception as e:
        flash(request, f'Error loading history: {str(e)}', 'error')
        class EmptyPagination:
            items = []; page = 1; pages = 1; total = 0; has_prev = False; has_next = False
            prev_num = None; next_num = None; per_page = per_page
            def iter_pages(self, **kwargs): return []
        return custom_template_response(request, 'history.html', {
            'predictions': EmptyPagination(), 'total_predictions': 0, 'real_count': 0, 'fake_count': 0,
            'search_query': search, 'filter_type': filter_type, 'sort_by': sort_by, 'per_page': per_page
        })

@app.get("/api/prediction/{prediction_id}")
async def get_prediction_details(prediction_id: int, current_user: User = Depends(get_current_user_required)):
    try:
        conn = get_db(TRUTH_DB)
        pred = conn.execute('SELECT * FROM predictions WHERE id = ? AND user_id = ?', (prediction_id, current_user.id)).fetchone()
        conn.close()
        if not pred: return JSONResponse({'error': 'Prediction not found'}, status_code=404)
        pd = dict(pred)
        return {'id': pd['id'], 'headline': pd['headline'], 'prediction': pd['prediction'], 'confidence': pd['confidence'], 'timestamp': pd['timestamp'], 'source': 'User Input'}
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=500)

@app.post("/api/prediction/{prediction_id}/delete")
async def delete_prediction(prediction_id: int, current_user: User = Depends(get_current_user_required)):
    try:
        conn = get_db(TRUTH_DB)
        pred = conn.execute('SELECT id FROM predictions WHERE id = ? AND user_id = ?', (prediction_id, current_user.id)).fetchone()
        if not pred:
            conn.close(); return JSONResponse({'error': 'Prediction not found'}, status_code=404)
        conn.execute('DELETE FROM predictions WHERE id = ?', (prediction_id,))
        conn.commit(); conn.close()
        
        try:
            fc = get_db(FEEDBACK_DB)
            fc.execute('DELETE FROM feedback WHERE prediction_id = ?', (prediction_id,))
            fc.commit(); fc.close()
        except: pass
        return {'success': True, 'message': 'Prediction deleted successfully'}
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=500)

@app.get("/export/history")
async def export_history(request: Request, current_user: User = Depends(get_current_user_required)):
    return await export_csv(request, current_user)

@app.get("/privacy", response_class=HTMLResponse)
async def privacy(request: Request): return custom_template_response(request, "privacy.html", {})

@app.get("/terms", response_class=HTMLResponse)
async def terms(request: Request): return custom_template_response(request, "terms.html", {})

@app.get("/cookies", response_class=HTMLResponse)
async def cookies(request: Request): return custom_template_response(request, "cookies.html", {})

@app.get("/live-news", response_class=HTMLResponse)
async def live_news(request: Request, current_user: User = Depends(get_current_user_required)):
    NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')
    if not NEWS_API_KEY or NEWS_API_KEY == 'your-news-api-key':
        flash(request, 'News API key not configured. Please contact administrator.', 'error')
        return custom_template_response(request, 'live_news.html', {'articles': []})
    try:
        params = {'apiKey': NEWS_API_KEY, 'language': 'en', 'country': 'us', 'pageSize': 20, 'sortBy': 'publishedAt'}
        async with httpx.AsyncClient() as client:
            resp = await client.get('https://newsapi.org/v2/top-headlines', params=params, timeout=10)
        news_data = resp.json()
        if resp.status_code == 200:
            articles = news_data.get('articles', [])
            cleaned_articles = []
            for a in articles:
                if not a.get('title') or a['title'] in ['[Removed]', '', None]: continue
                ca = {
                    'title': a.get('title', '').strip(),
                    'description': a.get('description', '').strip() if a.get('description') else None,
                    'url': a.get('url', '#'), 'urlToImage': a.get('urlToImage'), 'publishedAt': a.get('publishedAt'),
                    'source': {'name': a.get('source', {}).get('name', 'Unknown Source')}
                }
                if len(ca['title']) > 5: cleaned_articles.append(ca)
            return custom_template_response(request, 'live_news.html', {'articles': cleaned_articles})
        else:
            flash(request, f"Error fetching news: {news_data.get('message', 'Unknown error')}", 'error')
            return custom_template_response(request, 'live_news.html', {'articles': []})
    except Exception as e:
        flash(request, f'Error fetching news: {str(e)}', 'error')
        return custom_template_response(request, 'live_news.html', {'articles': []})

@app.get("/export-csv")
async def export_csv(request: Request, current_user: User = Depends(get_current_user_required)):
    try:
        conn = get_db(TRUTH_DB)
        predictions = conn.execute('''SELECT headline, prediction, confidence, timestamp 
                                     FROM predictions WHERE user_id = ? 
                                     ORDER BY timestamp DESC''', (current_user.id,)).fetchall()
        conn.close()
        if not predictions:
            flash(request, 'No prediction data to export.', 'info')
            return RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)
            
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(['Headline', 'Prediction', 'Confidence (%)', 'Timestamp (IST)'])
        for p in predictions:
            writer.writerow([p['headline'], p['prediction'], f"{p['confidence']:.2f}", p['timestamp']])
        output.seek(0)
        
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=truthlens_predictions_{current_user.username}_{datetime.now().strftime('%Y%m%d')}.csv"}
        )
    except Exception as e:
        flash(request, f'Error exporting data: {str(e)}', 'error')
        return RedirectResponse(url="/dashboard", status_code=status.HTTP_303_SEE_OTHER)

@app.get("/settings", response_class=HTMLResponse)
async def settings(request: Request, current_user: User = Depends(get_current_user_required)):
    try:
        conn = get_db(TRUTH_DB)
        total_predictions = conn.execute('SELECT COUNT(*) as count FROM predictions WHERE user_id = ?', (current_user.id,)).fetchone()['count']
        conn.close()
        return custom_template_response(request, 'settings.html', {'total_predictions': total_predictions})
    except:
        return custom_template_response(request, 'settings.html', {'total_predictions': 0})

@app.get("/help", response_class=HTMLResponse)
async def help_page(request: Request): return custom_template_response(request, "help.html", {})

@app.post("/api/settings/update-profile")
async def update_profile(request: Request, current_user: User = Depends(get_current_user_required)):
    return {'success': True, 'message': 'Profile updated successfully'}

@app.post("/api/settings/update-password")
async def update_password(request: Request, current_user: User = Depends(get_current_user_required)):
    try:
        data = await request.json()
        curr_pwd = data.get('current_password')
        new_pwd = data.get('new_password')
        if not curr_pwd or not new_pwd: return JSONResponse({'success': False, 'error': 'Missing required fields'}, status_code=400)
        
        conn = get_db(AUTH_DB)
        user = conn.execute('SELECT * FROM users WHERE id = ?', (current_user.id,)).fetchone()
        if not user or not check_password_hash(user['password_hash'], curr_pwd):
            conn.close(); return JSONResponse({'success': False, 'error': 'Current password is incorrect'}, status_code=401)
        
        conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (generate_password_hash(new_pwd), current_user.id))
        conn.commit(); conn.close()
        return {'success': True, 'message': 'Password updated successfully'}
    except Exception as e:
        return JSONResponse({'success': False, 'error': 'Failed to update password'}, status_code=500)

@app.post("/api/help/contact")
async def submit_contact_form(request: Request):
    return {'success': True, 'message': 'Message sent successfully'}

@app.post("/api/analyze")
async def analyze(request: Request, current_user: Optional[User] = Depends(get_current_user)):
    data = await request.json() or {}
    headline = (data.get('headline') or '').strip()
    source_url = (data.get('source_url') or '').strip() or None
    
    if not headline or len(headline) < 5:
        return JSONResponse({'error': 'Please provide a valid headline (min 5 chars).'}, status_code=400)
        
    try:
        verdict, confidence = await predict_news(headline)
        prediction = 'REAL' if verdict == 'REAL' or 'REAL' in str(verdict).upper() else 'FAKE'
        
        domain = None
        if source_url:
            from source_verifier import extract_domain
            domain = extract_domain(source_url)
            
        cred = compute_credibility(headline, confidence, prediction, domain)
        
        prediction_id = None
        if current_user:
            conn = get_db(TRUTH_DB)
            cursor = conn.cursor()
            cursor.execute('INSERT INTO predictions (user_id, headline, prediction, confidence, timestamp) VALUES (?, ?, ?, ?, ?)',
                         (current_user.id, headline, prediction, confidence, get_ist_time().isoformat()))
            prediction_id = cursor.lastrowid
            conn.commit(); conn.close()
            
        return {'prediction_id': prediction_id, 'verdict': prediction, 'bert_confidence': round(confidence, 2), **cred}
    except Exception as e:
        return JSONResponse({'error': str(e)}, status_code=500)

@app.post("/api/credibility-score")
async def credibility_score_public(request: Request):
    data = await request.json() or {}
    headline = (data.get('headline') or '').strip()
    source_url = (data.get('source_url') or '').strip() or None
    if not headline or len(headline) < 5: return JSONResponse({'error': 'Headline too short'}, status_code=400)
    try:
        verdict, confidence = await predict_news(headline)
        prediction = 'REAL' if verdict == 'REAL' or 'REAL' in str(verdict).upper() else 'FAKE'
        domain = None
        if source_url:
            from source_verifier import extract_domain
            domain = extract_domain(source_url)
        cred = compute_credibility(headline, confidence, prediction, domain)
        return {'verdict': prediction, 'bert_confidence': round(confidence, 2), **cred}
    except Exception as e: return JSONResponse({'error': str(e)}, status_code=500)

@app.options("/api/credibility-score")
async def credibility_score_public_options():
    return JSONResponse(status_code=204, content="")

@app.post("/api/verify-source")
async def api_verify_source(request: Request):
    data = await request.json() or {}
    url = (data.get('url') or data.get('domain') or '').strip()
    if not url: return JSONResponse({'error': 'Please provide a url or domain field.'}, status_code=400)
    try:
        result = verify_source(url)
        return result
    except Exception as e: return JSONResponse({'error': str(e)}, status_code=500)

@app.options("/api/verify-source")
async def api_verify_source_options():
    return JSONResponse(status_code=204, content="")

@app.get("/source-check", response_class=HTMLResponse)
async def source_check(request: Request): return custom_template_response(request, "source_check.html", {})

@app.get("/install-extension", response_class=HTMLResponse)
async def install_extension(request: Request): return custom_template_response(request, "install_extension.html", {})

@app.get("/download-extension")
async def download_extension(request: Request):
    import zipfile
    ext_dir = os.path.join(BASE_DIR, 'browser_extension')
    if not os.path.isdir(ext_dir):
        flash(request, 'Extension package not found.', 'error')
        return RedirectResponse(url="/install-extension", status_code=status.HTTP_303_SEE_OTHER)
        
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(ext_dir):
            dirs[:] = [d for d in dirs if not d.startswith('.') and d != '__pycache__']
            for file in files:
                abs_path = os.path.join(root, file)
                arc_name = os.path.relpath(abs_path, os.path.dirname(ext_dir))
                zf.write(abs_path, arc_name)
    buf.seek(0)
    
    return StreamingResponse(
        iter([buf.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=factora-extension.zip"}
    )
