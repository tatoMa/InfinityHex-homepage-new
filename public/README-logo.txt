Drop the real brand logo here as `logo.png` (from https://www.infinityhex.com/logo.png).

The <Logo> component requests /logo.png first and silently falls back to the
inline SVG mark if the file is absent, so no code change is needed — just add
the file. A square PNG at 160×160 or larger works best.
