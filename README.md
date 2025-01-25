## CreditScoringApp - zk-SNARK-Enabled Credit Scoring and Loan Approval

CreditScoringApp is a decentralized application built using o1js, designed to facilitate secure and privacy-preserving credit scoring and loan approvals. Leveraging the power of zk-SNARKs, the application ensures that sensitive financial data remains private while providing provable credit validation for financial services.

## Key features

- The application allows users to securely store and validate credit scores without exposing sensitive information to external parties.
- Implements zk-SNARKs to validate credit scores and other financial criteria, ensuring transparency and trustworthiness.
- Built-in loan approval mechanism based on credit score thresholds. Approvals are computed securely without revealing the underlying credit score.
- Credit scores are stored as on-chain state variables in the form of cryptographically secure fields, ensuring data integrity and auditability.
- The logic for approval and validation adheres to provable computations, leveraging the Bool and Field types provided by the o1js framework.

## Project Structure

- src/: Contains the core smart contract CreditScoringApp, implementing the credit scoring and loan approval logic. It contains test file as well for testing zkapp.

## Smart Contract Overview

- storeCreditScore(score: Field): Store a user’s credit score on-chain.
- approveLoan(): Determines if a loan can be approved based on the stored credit score.
- verifyCreditScoreZKP(zkp: Field): Validates a zero-knowledge proof against the stored credit score for secure verification.

## Loan Approval Logic

Loans are approved if the credit score meets or exceeds a specified threshold (e.g., 700). The decision-making process is abstracted into provable computations, ensuring security and privacy.

## Technologies Used

- o1js: A JavaScript framework for building zk-SNARK-enabled applications.
- zk-SNARKs: Ensures privacy-preserving computations.
- TypeScript: For strongly-typed smart contract development.

## Getting Started

- Prerequisites
- Node.js (v16+)
- o1js CLI installed globally: npm install -g zkapp-cli
- Git for version control


