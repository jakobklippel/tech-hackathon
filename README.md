# Meet JERRY

## Installation
```
cd backend/jerry-service
npm install
```

## Configuration
add a .env file with the following contents (ask us for the keys)
```
EMAIL_PASSWORD="xxxx"
GITHUB_TOKEN="xxxx"
APIFY_TOKEN="xxxx"
MISTRAL_KEY="xxxx"
GOTOHUMAN_KEY="xxxx"
GOTOHUMAN_FORM_ID="xxxx"
```

## Set up gotoHuman review form

Create a form with a markdown field with ID `markdown` and a text field with ID `email`

## Run the project
```
cd backend/jerry-service
npm run start:dev
```

## Send an email to
`hackathon@config.one`
including a link to a github repo and a loom video (note the video needs to be published with transcript)

### Example:
```
This is my github: 
https://github.com/jakobklippel/tech-hackathon

And this is my loom video:
https://www.loom.com/share/473fad25ebd24b5ea8091503253dfecf
```

### Check the Results
Check the results in your gotoHuman account

