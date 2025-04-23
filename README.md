[![codecov](https://codecov.io/gh/rit-swenms-gang/mupp/graph/badge.svg?token=ZK59KMK1BA)](https://codecov.io/gh/rit-swenms-gang/mupp)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=rit-swenms-gang_mupp)](https://sonarcloud.io/summary/new_code?id=rit-swenms-gang_mupp)
# MUPP
Welcome to the Multi-User Party Planner (MUPP). This project was inspired by the troubles that event organizers face in many-to-one preference-based group formation. Our solution allows custom form creation, shareable form links, and fully automated preference-based grouping, where you decide what is important for your event. Whether you are hosting a DnD night or conference scheduling, MUPP will provide you with a fully customizable grouping experience, eliminating the need for you to handle grouping by hand.

# Using MUPP
Start by creating an account as an event organizer and creating your first form. Ask for important information such as their name and email. Then you can ask questions that matter to you, such as, "How competitive do you like your games?" or "How long do you like your campaigns?", and assign weights to each question. The weights associated with each question correspond to how important it is to you, _as the event organizer_, that those preferences are prioritized when grouping leaders with participants.

Once you are satisfied, you can save the form and send the shareable link to your group leaders and participants! Once responses start flowing in, you will be able to view them on the dashboard and generate groupings.

# Running MUPP
## Database
Initialize a PostgreSQL database with a demo seed
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
