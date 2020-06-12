#!/bin/sh

ROOT_DIR=/usr/share/nginx/html/dist

# Replace env vars in JavaScript files
echo "Replacing env constants in JS"
for file in $ROOT_DIR/js/app.*.js* $ROOT_DIR/index.html;
do
  echo "Processing $file ...";
  sed -i 's|VUE_APP_API_URL|'${VUE_APP_API_URL}'|g' $file 
done

echo "Starting Nginx"
nginx -g 'daemon off;'
