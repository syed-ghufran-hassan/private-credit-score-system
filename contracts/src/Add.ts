import { Field, SmartContract, state, State, method, Bool, Provable } from 'o1js';

export class CreditScoringApp extends SmartContract {
  @state(Field) creditScore = State<Field>();

  // Initialize with a default value
  init() {
    super.init();
    this.creditScore.set(Field(0));
  }

  @method async storeCreditScore(score: Field) {
    this.creditScore.set(score);
  }

  @method async approveLoan(): Promise<void> {
    const isApproved = await this.checkLoanApproval();
    if (isApproved.isConstant()) {
      // If isConstant(), it's safe to convert to a native boolean
      const approved = isApproved.toBoolean();
      if (approved) {
        console.log('Loan Approved');
      } else {
        console.log('Loan Denied');
      }
    } else {
      // Use Provable.asProver to handle non-constant Bool
      Provable.asProver(() => {
        const approved = isApproved.toBoolean();
        if (approved) {
          console.log('Loan Approved');
        } else {
          console.log('Loan Denied');
        }
      });
    }
  }

  @method async verifyCreditScoreZKP(zkp: Field): Promise<void> {
    const isValidZkp = await this.checkZkpValidation(zkp);
    if (isValidZkp.isConstant()) {
      // If isConstant(), it's safe to convert to a native boolean
      const validZkp = isValidZkp.toBoolean();
      if (validZkp) {
        console.log('ZKP Verified');
      } else {
        console.log('ZKP Invalid');
      }
    } else {
      // Use Provable.asProver to handle non-constant Bool
      Provable.asProver(() => {
        const validZkp = isValidZkp.toBoolean();
        if (validZkp) {
          console.log('ZKP Verified');
        } else {
          console.log('ZKP Invalid');
        }
      });
    }
  }

  // Separate methods to return Bool (from o1js)
  private async checkLoanApproval(): Promise<Bool> {
    const score = this.creditScore.getAndRequireEquals();
    return score.greaterThanOrEqual(Field(700));  // This returns a Bool, not a boolean
  }

  private async checkZkpValidation(zkp: Field): Promise<Bool> {
    const score = this.creditScore.getAndRequireEquals();
    return score.equals(zkp);  // This returns a Bool, not a boolean
  }
}
