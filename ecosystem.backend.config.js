module.exports = {
  apps: [{
    // অ্যাপের নাম
    name: 'backend-api',
    
    // সরাসরি বিল্ট ফাইল (npm ওভারহেড নেই)
    script: 'dist/main.js',
    
    // সংখ্যা বা 'max' - সব CPU core ব্যবহার করবে
    instances: 'max',
    
    // ক্লাস্টার মোড (মাল্টি-কোর)
    exec_mode: 'cluster',
    
    // ফাইল পরিবর্তনে রিস্টার্ট না (প্রোডাকশনে false)
    watch: false,
    
    // মেমরি লিমিট (এর বেশি হলে রিস্টার্ট)
    max_memory_restart: '2G',
    
    // অটো-রিস্টার্ট (ক্র্যাশ হলে)
    autorestart: true,
    
    // ক্র্যাশ হলে কতবার রিস্টার্ট চেষ্টা করবে
    max_restarts: 10,
    
    // রিস্টার্টের মধ্যে সময় (মিলিসেকেন্ড)
    min_uptime: '10s',
    
    // এনভায়রনমেন্ট ভেরিয়েবল
    env: {
      NODE_ENV: 'production',
      PORT: 3007
    },
    
    // লগ ফাইল লোকেশন
    error_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/backend-error.log',
    out_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/backend-out.log',
    log_file: '/home/admin/domains/proappbackend.scratchwizard.net/logs/backend-combined.log',
    
    // লগে সময় যোগ করবে
    time: true,
    
    // কিল টাইমআউট (graceful shutdown)
    kill_timeout: 5000,
    
    // লিসেনিং পোর্ট চেক
    listen_timeout: 3000,
    
    // মেট্রিক্স (PM2 মেট্রিক্স বন্ধ)
    instance_var: 'INSTANCE_ID',
    
    // মের্জ লগ (সব instance-এর লগ একসাথে)
    merge_logs: true
  }]
}