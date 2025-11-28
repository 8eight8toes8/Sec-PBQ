
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const PrivilegeEscalationPBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="privilege_escalation"
      title="Privilege Escalation Detection"
      scenario="Investigate suspicious user activity that suggests an attempt to gain higher privileges."
      objective="Identify the type of privilege escalation attack."
      questions={[
        {
          id: "q1",
          text: "A standard user 'bob' gains access to the account of another standard user 'alice'. What is this?",
          options: [
            { value: "Horizontal", label: "Horizontal Privilege Escalation" },
            { value: "Vertical", label: "Vertical Privilege Escalation" },
            { value: "Rootkit", label: "Rootkit Installation" },
            { value: "Buffer Overflow", label: "Buffer Overflow" }
          ],
          correctValue: "Horizontal",
          feedback: "Horizontal escalation involves accessing resources of another user with the same privilege level."
        },
        {
          id: "q2",
          text: "A standard user exploits a kernel vulnerability to gain 'root' or 'SYSTEM' access. What is this?",
          options: [
            { value: "Vertical", label: "Vertical Privilege Escalation" },
            { value: "Horizontal", label: "Horizontal Privilege Escalation" },
            { value: "Phishing", label: "Phishing" },
            { value: "MITM", label: "Man-in-the-Middle" }
          ],
          correctValue: "Vertical",
          feedback: "Vertical escalation involves a lower privilege user gaining higher level (admin/root) privileges."
        },
        {
          id: "q3",
          text: "Which mitigation is most effective against vertical privilege escalation via software vulnerabilities?",
          options: [
            { value: "Patching", label: "Regular Patching and Updates" },
            { value: "Strong Passwords", label: "Strong Password Policy" },
            { value: "Encryption", label: "Disk Encryption" },
            { value: "Backup", label: "Regular Backups" }
          ],
          correctValue: "Patching",
          feedback: "Patching fixes the vulnerabilities that attackers exploit to elevate privileges."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default PrivilegeEscalationPBQ;
