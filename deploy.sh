echo "Deploy proceess..."

git pull

# Install dependencies
yarn

yarn build || exit

pm2 restart ecosystem.config.js

echo "Deploy done."
