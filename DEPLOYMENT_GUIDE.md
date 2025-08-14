# 🚀 Deploy Ziota: Frontend (Vercel) + Backend (Render)

## 📋 **Quick Setup (10 minutes total)**
- **Frontend**: React app → Vercel 
- **Backend**: Node.js API → Render

---

## 🎯 **STEP 1: Deploy Backend to Render (5 minutes)**

### **1.1 Create Render Account**
1. Go to **[render.com](https://render.com)**
2. **Sign up** with your GitHub account

### **1.2 Deploy Backend**
1. **Click "New +"** → **"Web Service"**
2. **Connect GitHub** → Select **"anxious2004/ziota"**
3. **Configure:**
   ```
   Name: ziota-backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

### **1.3 Add Environment Variables**
**Copy-paste each one exactly:**

```
NODE_ENV=production
```
```
PORT=10000
```
```
MONGO_URI=mongodb+srv://demonically2004:9eNVjMVsY5O42DK7@cluster0.ykkttaj.mongodb.net/ziota?retryWrites=true&w=majority&appName=Cluster0
```
```
JWT_SECRET=ziota_super_secret_jwt_key_2024_production_ready
```
```
CLOUD_NAME=dlcujlif7
```
```
CLOUD_API_KEY=432727221131427
```
```
CLOUD_API_SECRET=WxCmjLSoCJrKpOh4iQjZ1Gh0o0Q
```
```
FIREBASE_PROJECT_ID=ziota-aa366
```
```
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@ziota-aa366.iam.gserviceaccount.com
```
```
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC5Pn3VHEKB8cTa\nZPslxqzcKMY3KVkRKArl+Wgc+KTuSASDt/yqGQya9JIHE7H8ZGieBLuzPv44/BK4\nCnTfDQkcSbK2ZT+ETFnccfGzodnN/oHCz9r1MVehF4pBBsCC0PlVfkOJ4mXKYi4A\nYGgVlAqIbsyen8e6FVHeDX30SLiJdc3Mgu2229IU9xpKto/UbDyv4FY2uJYRXEWU\naV9WMiOBd3edd301BSSdbA9VfPwlBhLd9DBMSTN7XXE8g5pD6ODFNGo5XNbm3JV9\n4kjTUivz6OJU+Fq/KoftLPfubwyPTxprirBRezFinp/SN/DBhSspdzCEuL2ytkBW\nu2KG61fTAgMBAAECggEAAfOMZ9sy2mwKVXSezEK1N0BdPV9RGV/M+h9noVQZEXpy\n71NX8LpewbkeSZ1DiDgBW5Zgtc08xkT3G4PNwBoHFddMxUaA5fOknTkJY4mqsv8u\nYGrytwZwzhtAiq8Ejt5aexpwbm21JDIRkes+3XF1nouSYrOmYnZmsr2wHDY6blql\nWMGl3JK+Au3QT0EqXyIlwdqqnFf4UMI7S/mxzdALby1TEKhJBAdTUNXEyT9qLgDk\naHfBo2sYrUhIpO9tc/+eLueDFeYa9rSP4gPyhOTSWcIXbEXvtn+WfThGdSIuR5Nu\nNVjGmLCiohEbGhmNN5cu30R3jqEzE/oV+dG5H2jIDQKBgQD04H3Gto8kOv3EabQA\nu8zU5mOxgZEAqFULlDpgxPa+rClNTLdE7p3AT9xCkdHFLsGVA8c/wpo4LeuGLyfS\nHoXiDkYvz/cz4RhEhz4pLgKrhtZK0tX7AvpIggqXMzCmM0ijixtC4CA0/mLX5fbZ\nIKC6/GtZtooHQc83YxC/+YeLNwKBgQDBqJIIFFv8uP+8fvNL2uMInCbfvO/EHDoR\n3QIx6RXZiKXfasN7Cq/ewvS3Vl0lv9E2aRoM49dQ5SLjGObBkqo8XGQdYpCkC2TM\nTkEKbpy5+NfDMP1iR+ZcXTeVqyX+xOaqmg9bft26QvtCB+wOvOnnLWC48YZrpL5p\nMH5LXHC+RQKBgQCnzvuCZHKdYmuq4MEAy7GnqCZjayXiLHjzUWXcEL4CllpLZaol\n69thAZkwaVs2ZD82jftJ/2LN4vIG52PDgzU+X4fLlhmSjMujkoaPk78yqllJt0f6\nFuVLMQpu6R6KlpRNtrM81fhcOIOl7iqGSuy6luY9+XCHXprRGutMk4RGawKBgAvR\nHHAPxfkq1LgMyw3C4n2hAaI/ZiYCTuzOHpcrEOFAPFbgreLxKQAfx0z0oSRvivWV\n/jfxIy9VfAZ9e38uUuLyBE3iuM65v0HUOJXJYBjc/VV0xNFdb8oNChpA4kWkgCrC\n0dMUb7Uw5yIFV7sifedUVoWSf1BMMi46/knc7yg9AoGAe9vzZN/ItzebydjAqrGs\n8aclBoYDA1/4AxKhMLiUkrC89trzGQOE8UqKeq0qXmqk2UZK8irZwow4acpRwqEc\nCm3aOD0ZniFWUMHOpwoxdajhsOupMN9OGFkEm3DxRRnpObbjDLGMRzEmVNuh3GMD\nh/geyMdFJwD1WyKZYo+QEBE=\n-----END PRIVATE KEY-----\n"
```

### **1.4 Deploy & Get URL**
- **Click "Create Web Service"**
- **Wait 5-10 minutes** for deployment
- **Copy your backend URL** (like `https://ziota-backend.onrender.com`)

---

## 🎯 **STEP 2: Deploy Frontend to Vercel (3 minutes)**

### **2.1 Create New Vercel Project**
1. **Go to [vercel.com/new](https://vercel.com/new)**
2. **Import "anxious2004/ziota"** (create new project)
3. **Configure:**
   ```
   Project Name: ziota-frontend
   Framework: React
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: build
   ```

### **2.2 Add Environment Variables**
**Add these in Vercel:**

```
REACT_APP_API_URL=https://your-render-backend-url.onrender.com
```
```
REACT_APP_FIREBASE_API_KEY=AIzaSyBa-3Urpfzq-RN66bxwAcqr0v5DoRl3MaE
```
```
REACT_APP_FIREBASE_AUTH_DOMAIN=ziota-aa366.firebaseapp.com
```
```
REACT_APP_FIREBASE_PROJECT_ID=ziota-aa366
```
```
REACT_APP_FIREBASE_STORAGE_BUCKET=ziota-aa366.firebasestorage.app
```
```
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=311889063257
```
```
REACT_APP_FIREBASE_APP_ID=1:311889063257:web:8883034d831e5812f2f048
```

### **2.3 Deploy**
- **Click "Deploy"**
- **Wait 2-3 minutes**
- **Get your frontend URL** (like `https://ziota-frontend.vercel.app`)

---

## 🎯 **STEP 3: Update Firebase (1 minute)**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select "ziota-aa366"** project
3. **Authentication** → **Settings** → **Authorized domains**
4. **Add your Vercel frontend URL**

---

## 🎉 **Final Result:**
- **Frontend**: `https://ziota-frontend.vercel.app` (React app)
- **Backend**: `https://ziota-backend.onrender.com` (API)
- **Features**: File uploads, notes, authentication - all working!

## ✅ **Benefits:**
- ✅ **No more 404 errors** (clean separation)
- ✅ **Better performance** (Vercel CDN for frontend)
- ✅ **Easier debugging** (separate logs)
- ✅ **Free hosting** (both platforms have free tiers)

**This approach will definitely work! 🚀**
