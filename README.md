After checking out this folder from bitbucket using URL
git clone https://krutikamude@bitbucket.org/krutikamude/freelancer.git

follow below commands

Open command prompt in freelancer folder and type below commands

npm install
cd server-express-freelancer
npm install
npm install express -g
npm install -g express-generator
npm install mysql --save
npm install cors --save (add dependency to app.js)
npm install express-session --save
npm install bcrypt --save
npm install mocha chai --save
set PORT=3001 npm start

open another command prompt in freelancer folder and type below commands in it
cd client-react-freelancer
npm install
npm install redux react-redux --save
npm install axios --save
npm install immutable --save
npm install redux-thunk --save
npm install redux-logger --save
npm install react-router --save
npm install react-dom react-router-dom --save
npm install prop-types --save
npm install react-datepicker --save
npm install moment --save
npm install Dropzone --save
npm install react-native --save
npm install react-native-sha256 --save
npm install mocha chai --save
add "proxy":"http://localhost:3001"
npm start

launch application at 
copy this url in browser - http://localhost:3000/login and login and go forward