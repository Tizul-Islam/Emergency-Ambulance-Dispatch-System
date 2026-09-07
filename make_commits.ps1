git add package.json package-lock.json
git commit -m "chore: update dependencies and scripts"

git add .env.example
git commit -m "chore: add new environment variables template"

git add prisma/schema.prisma
git commit -m "feat(db): update prisma schema for new entities"

git add prisma/seed.ts
git commit -m "chore(db): update seed data"

git add prisma/migrations/
git commit -m "chore(db): add generated prisma migrations"

git rm -r --cached src/controllers/ 2>$null
git add src/controllers/ -u 2>$null
git commit -m "refactor: remove legacy controller directory"

git rm -r --cached src/routes/ 2>$null
git add src/routes/ -u 2>$null
git commit -m "refactor: remove legacy routes directory"

git rm -r --cached src/services/ 2>$null
git add src/services/ -u 2>$null
git commit -m "refactor: remove legacy services directory"

git rm -r --cached src/validations/ 2>$null
git add src/validations/ -u 2>$null
git commit -m "refactor: remove legacy validations directory"

git add src/config/
git commit -m "feat(config): add redis and centralized config"

git add src/middlewares/
git commit -m "feat(middleware): implement unified middleware structure"

git add src/shared/ src/utils/
git commit -m "feat(shared): add common utilities and response helpers"

git add src/app.ts
git commit -m "refactor(core): update main application setup"

git add src/modules/admin/
git commit -m "feat(admin): implement admin module"

git add src/modules/ambulance/
git commit -m "feat(ambulance): implement ambulance management module"

git add src/modules/audit/
git commit -m "feat(audit): implement audit logging module"

git add src/modules/auth/
git commit -m "feat(auth): implement authentication module"

git add src/modules/bkash/
git commit -m "feat(payment): implement bkash integration"

git add src/modules/dispatch/
git commit -m "feat(dispatch): implement ambulance dispatch logic"

git add src/modules/driver/
git commit -m "feat(driver): implement driver management module"

git add src/modules/health/ src/modules/hospital/
git commit -m "feat(health): implement health checks and hospital modules"

git add src/modules/notification/ src/modules/payment/
git commit -m "feat(notification): implement notifications and payments"

git add src/modules/request/ src/modules/trip/
git commit -m "feat(trip): implement request and trip modules"

git add src/modules/user/ src/modules/index.ts
git commit -m "feat(user): implement user module and router index"

git add README.md scripts/ Postman_Collection.json count.js generate_postman.js test.js test2.js .agents/ skills-lock.json
git commit -m "chore: update documentation and add utility scripts"

# Catch any remaining untracked/modified files that might have been missed
git add .
git commit -m "chore: final adjustments and minor updates"
