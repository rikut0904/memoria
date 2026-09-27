FROM node:26-alpine
WORKDIR /app
RUN apk add --no-cache openjdk17-jre-headless \
  && npm install --global firebase-tools@13.35.1
COPY firebase.json .firebaserc ./
EXPOSE 4000 8080 9099
ENTRYPOINT ["firebase"]
