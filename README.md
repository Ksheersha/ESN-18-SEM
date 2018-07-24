# ESN-S18-SEM

[![CircleCI](https://circleci.com/gh/cmusv-fse/f17-ESN-SA2.svg?style=svg&circle-token=f976cc228b77331f5be67cbc38313b5aaf97dbd0)](https://circleci.com/gh/cmusv-fse/f17-ESN-SA2)

[![BCH compliance](https://bettercodehub.com/edge/badge/cmusv-fse/ESN-S18-SEM?branch=staging&token=c04e4cb99b84a551c8b79941a624169074f2e5a6)](https://bettercodehub.com/)

[![Maintainability](https://api.codeclimate.com/v1/badges/2a1f26ba53644857d900/maintainability)](https://codeclimate.com/repos/5a7b68ccb8212102a8000ec3/maintainability)

https://esn-sem-s18.herokuapp.com/

ESN Application

YOU ARE NOT PERMITTED TO SHARE THIS REPO OUTSIDE THIS GITHUB ORG. YOU ARE NOT PERMITTED TO FORK THIS REPO UNDER ANY CIRCUMSTANCES.

***

#### How to Use
##### Environment Setting
* Install the dependencies:
``` 
npm install 
```
* Install other packages:
``` 
npm install --save package-name
```

##### MongoDB Setting
the server will look for this environment variable for MongoDB
```
export DB_PATH=mongodb://127.0.0.1:27017/esn
```

##### Run application
* Run application (for production, e.g., heroku deployment):
```
npm run-script start
```
* Run application on develop mode (changing files will restart application automatically)
```
npm run-script dev
```
* Run test on test database 
- this is an short-hand for setting things up and running `grunt test`
- This command will connect to another database `esn_test` on your local mongod. Data will be cleaned before each run.
```
npm run-script test
```
* Run code coverage
```
npm run-script coverage
```


***
### Iteration 1
#### Architecture Haiku
 * Available by our group members on [Google Doc](https://docs.google.com/a/west.cmu.edu/document/d/1gwBtrNjb-D8_xQW0fCpOQiiFu2ARBJGaZNMdJxpAcac/edit?usp=sharing)

#### RESTful API
 * Available by our group members on [Swagger Editor](https://app.swaggerhub.com/apis/cmu-sem/ESN-SEM/1.1)

### Iteration 5
#### User Story (Features: Map info, Share supplies)
* Available by our group members on [Google Doc](https://goo.gl/iutGE1)

### Common Credentials

- Heroku: https://id.heroku.com/login 
```
acc: zhenya.fan@sv.cmu.edu
pswd: fsebigboss
```
* For administrator access, please contact Ashuka (ashuka.xue@sv.cmu.edu)

- mLab, Online MongoDB service: https://mlab.com/home
```
acc: fsebigboss
pswd: fsebigboss17
```

### Course resources
 * [Canvas uses cases page](https://canvas.cmu.edu/courses/893/pages/use-cases-se-project-requirements?module_item_id=53086)
 * [Iteration requirements](https://canvas.cmu.edu/courses/893/modules#context_module_8918)

