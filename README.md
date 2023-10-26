# TR*AI*TOR

TR*AI*TOR is an AI Generated text and cheating detection web app designed to help educators and content creators ensure the originality of written content. Built with React, Flask, and Firebase, TR*AI*TOR combines the power of artificial intelligence with a user-friendly web interface to provide a comprehensive solution for detecting and preventing plagiarism.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Before you begin, ensure you have the following software installed on your machine:

    Node.js and npm
    Python 3.x
    Flask
    Firebase CLI

### Installing

Follow these steps to set up a development environment:

#### 1. Clone the repository to your local machine.

git clone https://github.com/ColeGarboski/trAItor.git

#### 2. Navigate to the project directory and install the necessary npm packages.

cd trAItor
npm install

#### 3. Set up a virtual environment for Flask and install the required Python packages.

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

#### 4. Set up Firebase

firebase login

#### 5. Start the development server.

npm run dev

## Deployment

To deploy the project on a live system, commit any changes to main through a pull request. Any API changes will be deployed to Heroku through Github Actions. Any changes to the frontend will be automatically deployed to Vercel.

## Built With

* [React](https://reactjs.org/) - The web framework used
* [Flask](https://flask.palletsprojects.com/en/2.0.x/) - The backend framework used
* [Firebase](https://firebase.google.com/) - Used for file hosting
* [Vercel](https://vercel.com/) - Used for frontend hosting
* [Heroku](https://dashboard.heroku.com/) - Used for backend hosting
* [Vite](https://vitejs.dev/) - The build tool used

## Contributing

Submit a pull request on the project and we'll take a look! This was a school project and not intended for full deployment, but any contributions are appreciated!

## Authors

- **Cole Garboski** - *Frontend* - [ColeGarboski](https://github.com/ColeGarboski)
- **Samuel Tyler** - *Full Stack* - [dude](https://github.com/dude)
- **Zachary Vandecar** - *Backend* - [ZachVandecar](https://github.com/ZachVandecar)

See also the list of [contributors](https://github.com/ColeGarboski/trAItor/contributors) who participated in this project.


## Acknowledgments

- We ❤️ Dastan Banae for guiding our project's development.
- This project was for the CS-303 Project Development Class @ SNHU 💙💛
