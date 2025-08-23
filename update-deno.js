import chalk from 'chalk'
import { spawnSync } from 'child_process'
import fs from 'fs'

const version = process.argv[2]
const filePath = 'deno.json'

const denoJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
denoJson.version = version
fs.writeFileSync(filePath, JSON.stringify(denoJson, null, 2) + '\n')
spawnSync('pnpm', ['prettier', '--write', 'deno.json'], { stdio: 'inherit' })

console.log(chalk.green(`✔ deno.json updated to version ${version}`))
