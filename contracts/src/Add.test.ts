import { AccountUpdate, Field, Mina, PrivateKey, PublicKey } from 'o1js';
import { CreditScoringApp } from './Add';
import { jest } from '@jest/globals';  // Add this import at the top of the test file


/*
 * This file specifies how to test the `CreditScoringApp` smart contract.
 * It is safe to delete this file and replace it with your own tests.
 */

let proofsEnabled = false;

describe('CreditScoringApp', () => {
  let deployerAccount: Mina.TestPublicKey,
    deployerKey: PrivateKey,
    senderAccount: Mina.TestPublicKey,
    senderKey: PrivateKey,
    zkAppAddress: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkApp: CreditScoringApp;

  beforeAll(async () => {
    if (proofsEnabled) await CreditScoringApp.compile();
  });

  beforeEach(async () => {
    const Local = await Mina.LocalBlockchain({ proofsEnabled });
    Mina.setActiveInstance(Local);
    [deployerAccount, senderAccount] = Local.testAccounts;
    deployerKey = deployerAccount.key;
    senderKey = senderAccount.key;

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new CreditScoringApp(zkAppAddress);
  });

  async function localDeploy() {
    const txn = await Mina.transaction(deployerAccount, async () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      await zkApp.deploy();
    });
    await txn.prove();
    // this tx needs .sign(), because `deploy()` adds an account update that requires signature authorization
    await txn.sign([deployerKey, zkAppPrivateKey]).send();
  }

  it('generates and deploys the Credit Scoring smart contract', async () => {
    await localDeploy();
    const creditScore = zkApp.creditScore.get();
    expect(creditScore).toEqual(Field(0));  // Default value should be 0
  });

  it('correctly stores the credit score in the Credit Scoring smart contract', async () => {
    await localDeploy();

    const newCreditScore = Field(750);
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(newCreditScore);  // Set new score
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    const storedCreditScore = zkApp.creditScore.get();
    expect(storedCreditScore).toEqual(newCreditScore);  // Expect the new credit score to be stored
  });

  it('approves loan if credit score is above 700', async () => {
    await localDeploy();

    // Set a score above 700
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(Field(750));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.approveLoan();  // This will log "Loan Approved"
    expect(logSpy).toHaveBeenCalledWith('Loan Approved');

    logSpy.mockRestore();  // Restore original console behavior
  });

  it('denies loan if credit score is below 700', async () => {
    await localDeploy();

    // Set a score below 700
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(Field(650));
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.approveLoan();  // This will log "Loan Denied"
    expect(logSpy).toHaveBeenCalledWith('Loan Denied');

    logSpy.mockRestore();  // Restore original console behavior
  });

  it('verifies credit score using ZKP', async () => {
    await localDeploy();

    // Set a score
    const creditScore = Field(750);
    const txn = await Mina.transaction(senderAccount, async () => {
      await zkApp.storeCreditScore(creditScore);
    });
    await txn.prove();
    await txn.sign([senderKey]).send();

    // Capture console output
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

    await zkApp.verifyCreditScoreZKP(creditScore);  // This will log "ZKP Verified"
    expect(logSpy).toHaveBeenCalledWith('ZKP Verified');

    logSpy.mockRestore();  // Restore original console behavior
  });
});
