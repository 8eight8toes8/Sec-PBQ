
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SecureProtocolsPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="secure_protocols"
      title="Secure Protocols Implementation"
      scenario="A security audit revealed the use of insecure protocols in your network. You must replace them with secure alternatives."
      objective="Select the secure replacement for each insecure protocol listed."
      questions={[
        {
          id: "q1",
          text: "Replace Telnet (Port 23) for remote command-line administration.",
          options: [
            { value: "SSH", label: "SSH (Port 22)" },
            { value: "RDP", label: "RDP (Port 3389)" },
            { value: "VNC", label: "VNC (Port 5900)" },
            { value: "FTP", label: "FTP (Port 21)" }
          ],
          correctValue: "SSH",
          feedback: "SSH provides encrypted remote administration, replacing cleartext Telnet."
        },
        {
          id: "q2",
          text: "Replace FTP (Port 21) for file transfers.",
          options: [
            { value: "TFTP", label: "TFTP" },
            { value: "SFTP", label: "SFTP (SSH File Transfer Protocol)" },
            { value: "SNMP", label: "SNMP" },
            { value: "HTTP", label: "HTTP" }
          ],
          correctValue: "SFTP",
          feedback: "SFTP uses SSH to encrypt file transfers, protecting data and credentials."
        },
        {
          id: "q3",
          text: "Replace HTTP (Port 80) for web traffic.",
          options: [
            { value: "HTTPS", label: "HTTPS (Port 443)" },
            { value: "HTML", label: "HTML" },
            { value: "DNS", label: "DNS" },
            { value: "SMTP", label: "SMTP" }
          ],
          correctValue: "HTTPS",
          feedback: "HTTPS uses TLS to encrypt web traffic, ensuring confidentiality and integrity."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default SecureProtocolsPBQ;
