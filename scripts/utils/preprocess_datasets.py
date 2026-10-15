import pandas as pd
import numpy as np
import os
import re
from sklearn.model_selection import train_test_split

DATASETS_DIR = r"c:\Users\prana_b2roblq\Downloads\Main Projects\FacTora\datasets"
OUTPUT_DIR = os.path.join(DATASETS_DIR, "processed")

if not os.path.exists(OUTPUT_DIR):
    os.makedirs(OUTPUT_DIR)

def clean_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    # Remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # Remove URLs
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    # Remove special characters and numbers
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    # Remove extra spaces
    text = re.sub(r'\s+', ' ', text).strip()
    return text

print("Loading datasets...")

dataframes = []

# 1. Fake.csv and True.csv (ISOT)
try:
    df_fake = pd.read_csv(os.path.join(DATASETS_DIR, "Fake.csv"))
    df_fake['text'] = df_fake['title'].astype(str) + " " + df_fake['text'].astype(str)
    df_fake = df_fake[['text']]
    df_fake['label'] = 0
    dataframes.append(df_fake)
    
    df_true = pd.read_csv(os.path.join(DATASETS_DIR, "True.csv"))
    df_true['text'] = df_true['title'].astype(str) + " " + df_true['text'].astype(str)
    df_true = df_true[['text']]
    df_true['label'] = 1
    dataframes.append(df_true)
except Exception as e:
    print(f"Error loading ISOT: {e}")

# 2. fake_and_real_news.csv
try:
    df_fr = pd.read_csv(os.path.join(DATASETS_DIR, "fake_and_real_news.csv"))
    df_fr = df_fr.rename(columns={'Text': 'text'})
    df_fr['label'] = df_fr['label'].apply(lambda x: 1 if str(x).lower().strip() == 'real' else 0)
    df_fr = df_fr[['text', 'label']]
    dataframes.append(df_fr)
except Exception as e:
    print(f"Error loading fake_and_real_news.csv: {e}")

# 3. fake_news_dataset1.csv
try:
    df_d1 = pd.read_csv(os.path.join(DATASETS_DIR, "fake_news_dataset1.csv"))
    df_d1['text'] = df_d1['title'].astype(str) + " " + df_d1['text'].astype(str)
    df_d1['label'] = df_d1['label'].apply(lambda x: 1 if str(x).lower().strip() == 'real' else 0)
    df_d1 = df_d1[['text', 'label']]
    dataframes.append(df_d1)
except Exception as e:
    print(f"Error loading fake_news_dataset1.csv: {e}")

# 4. fake_news_detection2.csv
try:
    df_d2 = pd.read_csv(os.path.join(DATASETS_DIR, "fake_news_detection2.csv"))
    df_d2['text'] = df_d2['title'].astype(str) + " " + df_d2['text'].astype(str)
    df_d2['label'] = df_d2['label'].apply(lambda x: 1 if str(x).lower().strip() == 'real' else 0)
    df_d2 = df_d2[['text', 'label']]
    dataframes.append(df_d2)
except Exception as e:
    print(f"Error loading fake_news_detection2.csv: {e}")

# 5. LIAR dataset (tsv files)
def load_liar(filename):
    filepath = os.path.join(DATASETS_DIR, filename)
    try:
        # LIAR has no header. The statement is at index 2, label at index 1
        df = pd.read_csv(filepath, sep='\t', header=None)
        # Drop rows that don't have enough columns
        df = df.dropna(subset=[1, 2])
        # Map labels
        valid_labels = ['true', 'mostly-true', 'false', 'pants-fire']
        df = df[df[1].isin(valid_labels)]
        df['label'] = df[1].apply(lambda x: 1 if x in ['true', 'mostly-true'] else 0)
        df = df.rename(columns={2: 'text'})
        return df[['text', 'label']]
    except Exception as e:
        print(f"Error loading {filename}: {e}")
        return pd.DataFrame()

dataframes.append(load_liar("train.tsv"))
dataframes.append(load_liar("valid.tsv"))
dataframes.append(load_liar("test.tsv"))

print("Concatenating dataframes...")
combined_df = pd.concat(dataframes, ignore_index=True)

print(f"Total rows before cleaning: {len(combined_df)}")

print("Handling missing values...")
combined_df['text'] = combined_df['text'].replace('nan', np.nan)
combined_df = combined_df.dropna(subset=['text'])

print("Removing duplicates...")
combined_df = combined_df.drop_duplicates(subset=['text'])

print(f"Total rows after removing missing/duplicates: {len(combined_df)}")

print("Applying text preprocessing (This might take a few minutes)...")
combined_df['text'] = combined_df['text'].apply(clean_text)

# Drop any rows that became empty after cleaning
combined_df = combined_df[combined_df['text'].str.strip() != ""]

print(f"Rows after text preprocessing: {len(combined_df)}")

# Balancing the dataset
print("Balancing classes...")
real_df = combined_df[combined_df['label'] == 1]
fake_df = combined_df[combined_df['label'] == 0]

print(f"Original -> Real: {len(real_df)}, Fake: {len(fake_df)}")

min_class_size = min(len(real_df), len(fake_df))

real_df = real_df.sample(n=min_class_size, random_state=42)
fake_df = fake_df.sample(n=min_class_size, random_state=42)

balanced_df = pd.concat([real_df, fake_df]).sample(frac=1, random_state=42).reset_index(drop=True)

print(f"Balanced -> Real: {len(real_df)}, Fake: {len(fake_df)}, Total: {len(balanced_df)}")

# Splitting 70/15/15
print("Splitting dataset (70% train, 15% val, 15% test)...")
# First split: 70% train, 30% temp (val + test)
train_df, temp_df = train_test_split(balanced_df, test_size=0.30, random_state=42, stratify=balanced_df['label'])
# Second split: 15% val, 15% test from the temp 30% (so 50% of the temp)
val_df, test_df = train_test_split(temp_df, test_size=0.50, random_state=42, stratify=temp_df['label'])

print(f"Train size: {len(train_df)}")
print(f"Validation size: {len(val_df)}")
print(f"Test size: {len(test_df)}")

print("Saving to CSV...")
train_df.to_csv(os.path.join(OUTPUT_DIR, "train.csv"), index=False)
val_df.to_csv(os.path.join(OUTPUT_DIR, "val.csv"), index=False)
test_df.to_csv(os.path.join(OUTPUT_DIR, "test.csv"), index=False)

print(f"Successfully processed and saved files in {OUTPUT_DIR}")
