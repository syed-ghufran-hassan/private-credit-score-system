import { PrivateKey, PublicKey, Mina, Field } from 'o1js';
import { CreditScoringApp } from './Add';

const zkAppAddress = '<YOUR_ZKAPP_PUBLIC_KEY>'; // Replace with your zkApp's public key
const creditScoringApp = new CreditScoringApp(PublicKey.fromBase58(zkAppAddress));

async function storeCreditScore(score: Field) {
  console.log(`Storing credit score of ${score.toString()}...`);
  const tx = await Mina.transaction(async () => {
    await creditScoringApp.storeCreditScore(score);
  });
  await tx.send();
  console.log('Credit score stored successfully!');
}

async function approveLoan() {
  // Wait for the approval process and log the result
  await creditScoringApp.approveLoan();
  console.log('Loan approval process completed.');
}

async function verifyCreditScoreZKP(score: Field) {
  // Wait for the ZKP verification process and log the result
  await creditScoringApp.verifyCreditScoreZKP(score);
  console.log('ZKP verification process completed.');
}

// Example usage
(async () => {
  const score = Field(750);  // Example credit score
  await storeCreditScore(score);  // Store the credit score
  await approveLoan();           // Check loan approval status
  await verifyCreditScoreZKP(score);  // Verify credit score with ZKP
})();
