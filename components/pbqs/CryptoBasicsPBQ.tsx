
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const CryptoBasicsPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="crypto_basics"
      title="Cryptography Basics"
      scenario="You are designing a secure storage solution for sensitive customer data. You need to select the appropriate cryptographic algorithms for different use cases."
      objective="Choose the correct algorithm for Data at Rest, Data in Transit, and Hashing."
      questions={[
        {
          id: "q1",
          text: "Which algorithm should be used to encrypt the database files (Data at Rest) to ensure strong confidentiality?",
          options: [
            { value: "AES-256", label: "AES-256" },
            { value: "DES", label: "DES" },
            { value: "MD5", label: "MD5" },
            { value: "ROT13", label: "ROT13" }
          ],
          correctValue: "AES-256",
          feedback: "AES-256 is the industry standard for symmetric encryption of data at rest."
        },
        {
          id: "q2",
          text: "Which protocol should be used to secure data being transmitted over the web (Data in Transit)?",
          options: [
            { value: "HTTP", label: "HTTP" },
            { value: "TLS 1.3", label: "TLS 1.3" },
            { value: "SSL 3.0", label: "SSL 3.0" },
            { value: "Telnet", label: "Telnet" }
          ],
          correctValue: "TLS 1.3",
          feedback: "TLS 1.3 is the most secure version of the Transport Layer Security protocol."
        },
        {
          id: "q3",
          text: "Which algorithm should be used to hash user passwords before storing them?",
          options: [
            { value: "SHA-1", label: "SHA-1" },
            { value: "MD5", label: "MD5" },
            { value: "Bcrypt (SHA-256 based)", label: "Bcrypt" },
            { value: "CRC32", label: "CRC32" }
          ],
          correctValue: "Bcrypt (SHA-256 based)",
          feedback: "Bcrypt is designed to be slow and salt-resistant, making it ideal for password hashing."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default CryptoBasicsPBQ;
