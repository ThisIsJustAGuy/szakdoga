FROM node:20.17.0 AS build

WORKDIR /src

COPY package*.json ./

RUN npm install

RUN npm install -g @angular/cli

COPY . .

RUN ng build --configuration production

FROM nginx:alpine

COPY --from=build /src/dist/appointy/browser /usr/share/nginx/html/

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]