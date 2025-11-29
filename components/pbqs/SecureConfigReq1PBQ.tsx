
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SecureConfigReq1PBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="req_1"
      title="Secure Config Req 1: Server Hardening"
      scenario="You are hardening a new Windows Server 2022 instance before deployment."
      objective="Select the correct hardening action for each category."
      questions={[
        {
          id: "q1",
          text: "What should be done with the 'Guest' account?",
          options: [
            { value: "Disable", label: "Disable the account" },
            { value: "Rename", label: "Rename it to 'Admin'" },
            { value: "Password", label: "Set a strong password" },
            { value: "Nothing", label: "Leave as default" }
          ],
          correctValue: "Disable",
          feedback: "The Guest account provides anonymous access and should always be disabled on secure servers."
        },
        {
          id: "q2",
          text: "Which service should be disabled if not explicitly needed?",
          options: [
            { value: "Print Spooler", label: "Print Spooler" },
            { value: "Windows Update", label: "Windows Update" },
            { value: "Firewall", label: "Windows Firewall" },
            { value: "Event Log", label: "Windows Event Log" }
          ],
          correctValue: "Print Spooler",
          feedback: "The Print Spooler is a common attack vector (e.g., PrintNightmare) and should be disabled on non-print servers."
        },
        {
          id: "q3",
          text: "What is the best practice for RDP access?",
          options: [
            { value: "VPN", label: "Restrict to VPN / Management IP" },
            { value: "Public", label: "Open to 0.0.0.0/0" },
            { value: "Change Port", label: "Change port to 3390" },
            { value: "Disable NLA", label: "Disable Network Level Authentication" }
          ],
          correctValue: "VPN",
          feedback: "RDP should never be exposed directly to the internet; access should be tunneled via VPN."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default SecureConfigReq1PBQ;
