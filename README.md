[![codecov](https://codecov.io/gh/rit-swenms-gang/mupp/graph/badge.svg?token=ZK59KMK1BA)](https://codecov.io/gh/rit-swenms-gang/mupp)
# mupp
Multi-user party planner

## Database
Initialize a PostgreSQL database with demo seed
```
bash config/demo_setup.sh
```

## Backend
Flask server hosted on port `5001`.
```python
pip install -r requirements.txt
python src/server.py
```

## Client
Vite dev server hosted on port `5173`.
```js
cd client
npm ci
npm run dev
```
