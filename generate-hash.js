const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'Admin123';
  const hash = await bcrypt.hash(password, 10);
  
  console.log('Password:', password);
  console.log('Bcrypt Hash:', hash);
  console.log('Hash Length:', hash.length);
  
  // Test verify
  const isValid = await bcrypt.compare(password, hash);
  console.log('Verification test:', isValid);
}

generateHash();
