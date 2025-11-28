
import React from 'react';
import GenericPBQ from './GenericPBQ';

interface Props {
  onComplete: (score: number) => void;
  onExit: () => void;
}

const NetworkArchitecturePBQ: React.FC<Props> = ({ onComplete, onExit }) => {
  return (
    <GenericPBQ
      id="network_architecture"
      title="Secure Network Architecture"
      scenario="Design a segmented network to improve security posture and reduce the blast radius of a breach."
      objective="Assign the correct network segment or technology to the scenario."
      questions={[
        {
          id: "q1",
          text: "Where should you place a public-facing web server?",
          options: [
            { value: "DMZ", label: "DMZ (Demilitarized Zone)" },
            { value: "LAN", label: "Internal LAN" },
            { value: "Management", label: "Management VLAN" },
            { value: "Guest", label: "Guest Network" }
          ],
          correctValue: "DMZ",
          feedback: "Public-facing services should be isolated in a DMZ to protect the internal network."
        },
        {
          id: "q2",
          text: "You want to separate the Finance department's traffic from the Engineering department. What technology should you use?",
          options: [
            { value: "VLAN", label: "VLAN (Virtual LAN)" },
            { value: "VPN", label: "VPN" },
            { value: "NAT", label: "NAT" },
            { value: "Proxy", label: "Proxy Server" }
          ],
          correctValue: "VLAN",
          feedback: "VLANs are used to logically segment traffic on the same physical infrastructure."
        },
        {
          id: "q3",
          text: "To safely manage switches and routers remotely, they should be placed in a:",
          options: [
            { value: "OOB", label: "Out-of-Band (OOB) Management Network" },
            { value: "DMZ", label: "DMZ" },
            { value: "Guest", label: "Guest Network" },
            { value: "Public", label: "Public Subnet" }
          ],
          correctValue: "OOB",
          feedback: "Management interfaces should be on a separate, restricted Out-of-Band network."
        }
      ]}
      onComplete={onComplete}
      onExit={onExit}
    />
  );
};

export default NetworkArchitecturePBQ;
