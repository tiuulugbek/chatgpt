# GitHub'ga Push Qilish

## ✅ Commit qilindi!

Barcha fayllar commit qilindi. Endi GitHub'ga push qilish kerak.

## Authentication Usullari

### Variant 1: Personal Access Token (Tavsiya etiladi)

1. **GitHub'da Personal Access Token yarating:**
   - GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
   - "Generate new token" → "Generate new token (classic)"
   - Token nomi: `soundz-crm`
   - Scopes: `repo` ni tanlang
   - "Generate token" ni bosing
   - **Token'ni nusxalab oling!** (bir marta ko'rsatiladi)

2. **Push qilish:**
   ```powershell
   cd C:\Users\AzzaPRO\Desktop\Soundz-crm
   git push -u origin main
   ```
   - Username: `tiuulugbek`
   - Password: **Token'ni kiriting** (parol emas!)

### Variant 2: GitHub CLI

```powershell
# GitHub CLI o'rnatish (agar yo'q bo'lsa)
winget install GitHub.cli

# Login qilish
gh auth login

# Push qilish
git push -u origin main
```

### Variant 3: SSH Key

1. **SSH key yarating:**
   ```powershell
   ssh-keygen -t ed25519 -C "tiuulugbek@example.com"
   ```

2. **Public key'ni GitHub'ga qo'shing:**
   - GitHub → Settings → SSH and GPG keys → New SSH key
   - `~/.ssh/id_ed25519.pub` faylini ochib, content'ni qo'shing

3. **Remote URL'ni o'zgartiring:**
   ```powershell
   git remote set-url origin git@github.com:tiuulugbek/chatgpt.git
   git push -u origin main
   ```

## Tezkor Push (Token bilan)

```powershell
cd C:\Users\AzzaPRO\Desktop\Soundz-crm

# Token bilan push (token'ni o'z o'rniga qo'ying)
git push https://YOUR_TOKEN@github.com/tiuulugbek/chatgpt.git main
```

Yoki:

```powershell
# Remote URL'ni token bilan o'zgartirish
git remote set-url origin https://YOUR_TOKEN@github.com/tiuulugbek/chatgpt.git
git push -u origin main
```

## Tekshirish

Push muvaffaqiyatli bo'lsa:
- https://github.com/tiuulugbek/chatgpt sahifasida barcha fayllar ko'rinishi kerak

## Keyingi Push'lar

Keyingi safar o'zgarishlarni push qilish:

```powershell
git add .
git commit -m "O'zgarishlar tavsifi"
git push
```


