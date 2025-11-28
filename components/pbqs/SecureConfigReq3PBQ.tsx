
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const SecureConfigReq3PBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="req_3"
      title="Secure Config Req 3: Zero Trust Architecture"
      scenario="Implement Zero Trust principles in an existing environment."
      objective="Select the core Zero Trust principle applicable to the situation."
      questions={[
        {
          id: "q1",
          text: "A user inside the corporate office LAN attempts to access a file server. How should the request be treated?",
          options: [
            { value: "Verify", label: "Verify identity and context before granting access" },
            { value: "Trust", label: "Trust because they are on the LAN" },
            { value: "Block", label: "Block all internal traffic" },
            { value: "Sandbox", label: "Sandbox the user" }
          ],
          correctValue: "Verify",
          feedback: "Zero Trust assumes no implicit trust based on network location. Always verify."
        },
        {
          id: "q2",
          text: "Which technology is essential for making dynamic access decisions in Zero Trust?",
          options: [
            { value: "PDP", label: "Policy Decision Point (PDP)" },
            { value: "Hub", label: "Network Hub" },
            { value: "Repeater", label: "Repeater" },
            { value: "Tape Drive", label: "Tape Drive" }
          ],
          correctValue: "PDP",
          feedback: "A PDP evaluates requests against policies and context to authorize or deny access."
        },
        {
          id: "q3",
          text: "Instead of a traditional VPN granting full network access, Zero Trust uses:",
          options: [
            { value: "ZTNA", label: "Zero Trust Network Access (ZTNA)" },
            { value: "PPTP", label: "PPTP" },
            { value: "WEP", label: "WEP" },
            { value: "Telnet", label: "Telnet" }
          ],
          correctValue: "ZTNA",
          feedback: "ZTNA provides application-level access rather than full network-level access."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default SecureConfigReq3PBQ;
