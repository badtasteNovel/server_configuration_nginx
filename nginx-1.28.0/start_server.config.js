const config = require('./config.js');
const path = require('path');
// 判斷方式：檢查是否有傳入 --env dev 參數
const isDev = process.argv.includes('dev'); 
const activeConfig = isDev ? config.local : config.server;
/**
 * 除了 apps，這個設定檔還可以包含其他頂級索引（Root keys），例如：deploy: 用於定義自動化部署（例如將程式碼從 GitHub 拉取到伺服器）。source_map_support: 全域開啟原始碼對照支援。
 */

// 使用 path.join 拼接
const phpPath=activeConfig.phpPath;
const nginxPath=activeConfig.nginxPath;
const phpCgiExe = path.join(activeConfig.phpPath, 'php-cgi.exe');
const phpListen = `127.0.0.1:${activeConfig.phpCgiPort}`;
module.exports = {
  apps : [
    {
      // 1. PHP-CGI 服務 (取代原本 .bat 裡的 php-cgi 部分)
      name: 'php-cgi',
      script: phpCgiExe,
      args: `-b ${phpListen}`,
      cwd: phpPath,
      env: {
        PHPRC: phpPath // 取代 set PHPRC
      },
      autorestart: true
    },
    {
      // 2. Nginx 服務 (取代原本 .bat 裡的 nginx 部分)
      name: 'nginx-server',
      script: 'nginx.exe',
      args: '-g "daemon off;"', // 必須加這行，PM2 才能後台監控它
      cwd: nginxPath,
      kill_timeout: 3000,
      autorestart: true
    },
    {
      // 3. Reverb 服務 (你原本的 Laravel Reverb)
      name: 'reverb',
      interpreter: 'php',
      script: 'artisan',
      args: 'reverb:start',
      cwd: activeConfig.projectPath,
      autorestart: true,
      max_memory_restart: '512M', // 根據伺服器規格調整，1G 或 512M
      out_file: './storage/logs/pm2-reverb-out.log', // 建議分開存放日誌
      error_file: './storage/logs/pm2-reverb-err.log',
      merge_logs: true,
    }
    
  ]
};
