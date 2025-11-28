
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const PKICertsPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="pki_certs"
      title="PKI & Certificate Management"
      scenario="You are managing the Public Key Infrastructure (PKI) for your organization. You need to handle certificate lifecycle events."
      objective="Choose the correct action for each PKI scenario."
      questions={[
        {
          id: "q1",
          text: "A web server's private key has been compromised. What is the immediate first step?",
          options: [
            { value: "Revoke", label: "Revoke the certificate" },
            { value: "Renew", label: "Renew the certificate" },
            { value: "Delete", label: "Delete the certificate from the server" },
            { value: "Ignore", label: "Wait for it to expire" }
          ],
          correctValue: "Revoke",
          feedback: "If a private key is compromised, the certificate must be revoked immediately via CRL or OCSP."
        },
        {
          id: "q2",
          text: "Which component stores the list of revoked certificates?",
          options: [
            { value: "CRL", label: "CRL (Certificate Revocation List)" },
            { value: "CA", label: "CA (Certificate Authority)" },
            { value: "CSR", label: "CSR (Certificate Signing Request)" },
            { value: "Key Escrow", label: "Key Escrow" }
          ],
          correctValue: "CRL",
          feedback: "The CRL is a list of digital certificates that have been revoked by the issuing CA before their scheduled expiration date."
        },
        {
          id: "q3",
          text: "You need to request a new certificate for a web server. What do you generate first?",
          options: [
            { value: "CSR", label: "CSR (Certificate Signing Request)" },
            { value: "CRL", label: "CRL" },
            { value: "Public Key", label: "Public Key only" },
            { value: "Self-signed Cert", label: "Self-signed Certificate" }
          ],
          correctValue: "CSR",
          feedback: "A CSR contains the public key and identity information and is sent to the CA to apply for a certificate."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default PKICertsPBQ;
