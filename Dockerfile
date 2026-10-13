FROM alpine:edge AS build
	COPY ./ /tmp/build/
	WORKDIR /tmp/build/
	ENV WEBSITE_ADAPTER=static
	RUN apk add yarn
	RUN yarn install
	RUN yarn run turbo run 'website#build'

FROM nginx:stable-alpine
	COPY --from=build /tmp/build/website/build/ /usr/share/nginx/html/
