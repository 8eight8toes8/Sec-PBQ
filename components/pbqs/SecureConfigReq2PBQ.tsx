
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SecureConfigReq2PBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="req_2"
      title="Secure Config Req 2: Compliance Auditing"
      scenario="You are conducting an internal audit to ensure compliance with company security policies."
      objective="Identify the non-compliant finding in each scenario."
      questions={[
        {
          id: "q1",
          text: "Policy requires FDE (Full Disk Encryption) on all laptops. You find a laptop with BitLocker 'Suspended'. Is this compliant?",
          options: [
            { value: "No", label: "No, data is at rest unencrypted" },
            { value: "Yes", label: "Yes, because it's installed" },
            { value: "Maybe", label: "Depends on the user" },
            { value: "Partial", label: "Yes, the key is present" }
          ],
          correctValue: "No",
          feedback: "If BitLocker is suspended, the drive is effectively unlocked and data is not protected at rest."
        },
        {
          id: "q2",
          text: "Policy requires MFA for all remote access. A user logs into the VPN with just a username and password. Finding?",
          options: [
            { value: "Non-compliant", label: "Non-compliant: MFA missing" },
            { value: "Compliant", label: "Compliant" },
            { value: "Exception", label: "Policy Exception" },
            { value: "Unknown", label: "Need more info" }
          ],
          correctValue: "Non-compliant",
          feedback: "Single-factor authentication violates the MFA requirement for remote access."
        },
        {
          id: "q3",
          text: "You find sensitive HR documents on a public file share open to 'Everyone'. Violation of:",
          options: [
            { value: "Least Privilege", label: "Principle of Least Privilege" },
            { value: "Separation of Duties", label: "Separation of Duties" },
            { value: "Rotation", label: "Job Rotation" },
            { value: "Defense in Depth", label: "Defense in Depth" }
          ],
          correctValue: "Least Privilege",
          feedback: "Granting 'Everyone' access violates Least Privilege; only HR staff should have access."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default SecureConfigReq2PBQ;
