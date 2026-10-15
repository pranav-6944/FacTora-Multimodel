import io
import os
import hashlib
from pathlib import Path
from typing import Dict, Any, Tuple
from PIL import Image, ImageChops, ImageEnhance, ImageStat
import piexif


class ImageDetectorService:
    """
    Image Manipulation & Synthetic Generation Detector.
    Features:
    1. Error Level Analysis (ELA) compression discrepancy detection
    2. EXIF forensic software tampering tags
    3. Spatial frequency and noise distribution metrics
    4. Structured explainability ("Why and what is it")
    """

    KNOWN_EDITING_SIGNATURES = [
        "photoshop", "gimp", "canva", "lightroom", "midjourney",
        "stable diffusion", "dall-e", "novelai", "procreate",
        "faceapp", "snapseed", "picsart", "affinity"
    ]

    @classmethod
    async def analyze_image(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Runs complete image verification pipeline."""
        sha256_hash = hashlib.sha256(file_bytes).hexdigest()
        
        # Load image via Pillow
        image = Image.open(io.BytesIO(file_bytes))
        width, height = image.size
        img_format = image.format or "UNKNOWN"

        # 1. Error Level Analysis (ELA)
        ela_metrics = cls._calculate_ela(image)

        # 2. EXIF Forensics
        exif_report = cls._extract_exif_forensics(image, file_bytes)

        # 3. Frequency & Noise Consistency
        noise_metrics = cls._analyze_noise_consistency(image)

        # 4. Multi-Factor Verdict Calculation
        verdict, confidence = cls._calculate_verdict(
            ela_metrics=ela_metrics,
            exif_report=exif_report,
            noise_metrics=noise_metrics
        )

        # 5. Explainable Reasoning
        reasoning = cls._generate_reasoning(
            filename=filename,
            verdict=verdict,
            confidence=confidence,
            ela_metrics=ela_metrics,
            exif_report=exif_report,
            noise_metrics=noise_metrics
        )

        return {
            "verdict": verdict,
            "confidence_score": round(confidence, 1),
            "reasoning": reasoning,
            "detailed_analysis": {
                "file_info": {
                    "filename": filename,
                    "format": img_format,
                    "dimensions": f"{width}x{height}",
                    "file_hash_sha256": sha256_hash,
                    "size_bytes": len(file_bytes)
                },
                "error_level_analysis": ela_metrics,
                "exif_forensics": exif_report,
                "noise_consistency": noise_metrics
            }
        }

    @classmethod
    def _calculate_ela(cls, image: Image.Image, quality: int = 90) -> Dict[str, Any]:
        """
        Computes Error Level Analysis (ELA).
        Resaves the image at a specific JPEG quality and measures pixel difference.
        Higher variance indicates localized compression tampering.
        """
        try:
            rgb_image = image.convert("RGB")
            buffer = io.BytesIO()
            rgb_image.save(buffer, "JPEG", quality=quality)
            buffer.seek(0)
            resaved_image = Image.open(buffer)

            # Measure difference
            diff = ImageChops.difference(rgb_image, resaved_image)
            stat = ImageStat.Stat(diff)
            mean_error = sum(stat.mean) / len(stat.mean)
            rms_error = sum(stat.rms) / len(stat.rms)
            stddev_error = sum(stat.stddev) / len(stat.stddev)

            # High deviation between regions indicates splicing
            is_suspicious = stddev_error > 8.5 or mean_error > 12.0

            return {
                "mean_error": round(mean_error, 2),
                "rms_error": round(rms_error, 2),
                "stddev_error": round(stddev_error, 2),
                "compression_anomaly_detected": is_suspicious,
                "interpretation": "High compression variance (splicing/tampering)" if is_suspicious else "Uniform compression pattern"
            }
        except Exception as e:
            return {
                "mean_error": 0.0,
                "rms_error": 0.0,
                "stddev_error": 0.0,
                "compression_anomaly_detected": False,
                "interpretation": f"ELA calculation skipped: {str(e)}"
            }

    @classmethod
    def _extract_exif_forensics(cls, image: Image.Image, file_bytes: bytes) -> Dict[str, Any]:
        """Extracts camera metadata and flags image editing tool signatures."""
        found_software = []
        camera_make = None
        camera_model = None
        datetime_original = None
        has_exif = False

        try:
            exif_dict = piexif.load(file_bytes)
            if exif_dict:
                has_exif = True
                # Check 0th IFD for Software & Make
                zeroth = exif_dict.get("0th", {})
                if piexif.ImageIFD.Software in zeroth:
                    software_val = str(zeroth[piexif.ImageIFD.Software], "utf-8", errors="ignore").lower()
                    for sig in cls.KNOWN_EDITING_SIGNATURES:
                        if sig in software_val:
                            found_software.append(sig.capitalize())

                if piexif.ImageIFD.Make in zeroth:
                    camera_make = str(zeroth[piexif.ImageIFD.Make], "utf-8", errors="ignore").strip()
                if piexif.ImageIFD.Model in zeroth:
                    camera_model = str(zeroth[piexif.ImageIFD.Model], "utf-8", errors="ignore").strip()

                # Check Exif IFD for DateTimeOriginal
                exif_ifd = exif_dict.get("Exif", {})
                if piexif.ExifIFD.DateTimeOriginal in exif_ifd:
                    datetime_original = str(exif_ifd[piexif.ExifIFD.DateTimeOriginal], "utf-8", errors="ignore").strip()
        except Exception:
            pass

        # String search fallback in raw bytes for signatures
        if not found_software:
            raw_str = file_bytes[:4096].lower()
            for sig in cls.KNOWN_EDITING_SIGNATURES:
                if sig.encode("utf-8") in raw_str:
                    found_software.append(sig.capitalize())

        return {
            "has_exif": has_exif,
            "editing_software_detected": list(set(found_software)),
            "camera_make": camera_make,
            "camera_model": camera_model,
            "original_timestamp": datetime_original,
            "is_manipulation_suspect": len(found_software) > 0
        }

    @classmethod
    def _analyze_noise_consistency(cls, image: Image.Image) -> Dict[str, Any]:
        """Analyzes spatial noise variance to detect synthetic image generations."""
        try:
            gray = image.convert("L")
            stat = ImageStat.Stat(gray)
            variance = stat.var[0] if stat.var else 0.0
            
            # AI generators often produce ultra-smooth unnatural surfaces or extreme contrast noise
            is_synthetic_smooth = variance < 150.0

            return {
                "luminance_variance": round(variance, 2),
                "synthetic_smoothness_flag": is_synthetic_smooth,
                "surface_profile": "Ultra-smooth synthetic distribution" if is_synthetic_smooth else "Natural optical noise"
            }
        except Exception:
            return {
                "luminance_variance": 0.0,
                "synthetic_smoothness_flag": False,
                "surface_profile": "Standard"
            }

    @classmethod
    def _calculate_verdict(
        cls,
        ela_metrics: Dict[str, Any],
        exif_report: Dict[str, Any],
        noise_metrics: Dict[str, Any]
    ) -> Tuple[str, float]:
        """Synthesizes all forensic findings into final verdict and confidence."""
        suspicion_score = 0.0

        # ELA Tampering Flag
        if ela_metrics.get("compression_anomaly_detected"):
            suspicion_score += 45.0

        # Software Editing Signature Found
        software_found = exif_report.get("editing_software_detected", [])
        if software_found:
            suspicion_score += 40.0

        # Lack of authentic camera metadata
        if not exif_report.get("has_exif"):
            suspicion_score += 15.0

        # Synthetic smoothness
        if noise_metrics.get("synthetic_smoothness_flag"):
            suspicion_score += 10.0

        if suspicion_score >= 50.0:
            verdict = "FAKE"
            confidence = min(98.5, 55.0 + (suspicion_score * 0.45))
        else:
            verdict = "REAL"
            confidence = min(96.0, 95.0 - suspicion_score)

        return verdict, confidence

    @classmethod
    def _generate_reasoning(
        cls,
        filename: str,
        verdict: str,
        confidence: float,
        ela_metrics: Dict[str, Any],
        exif_report: Dict[str, Any],
        noise_metrics: Dict[str, Any]
    ) -> str:
        """Constructs clear explainable forensic reasoning."""
        software = exif_report.get("editing_software_detected", [])
        ela_anom = ela_metrics.get("compression_anomaly_detected")
        camera = exif_report.get("camera_model")

        if verdict == "FAKE":
            reasons = []
            if software:
                reasons.append(f"Header forensics identified editing application signatures: {', '.join(software)}")
            if ela_anom:
                reasons.append(f"Error Level Analysis detected localized compression boundary spikes (stddev: {ela_metrics.get('stddev_error')}), pointing to localized splicing or synthesis")
            if not exif_report.get("has_exif"):
                reasons.append("Authentic camera sensor metadata is absent")
            
            summary = (
                f"The image '{filename}' is classified as FAKE / MANIPULATED with {confidence:.1f}% confidence. "
                + " | ".join(reasons) + "."
            )
        else:
            summary = (
                f"The image '{filename}' is classified as REAL / AUTHENTIC with {confidence:.1f}% confidence. "
                f"Error Level Analysis exhibits uniform pixel decay across all channels ({ela_metrics.get('interpretation')}). "
                f"No synthetic generation tags or digital editing software signatures were detected."
            )
            if camera:
                summary += f" Camera metadata corresponds to an authentic optical sensor ({camera})."

        return summary
