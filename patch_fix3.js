import fs from 'fs';

const filePath = 'src/components/PeopleDiscovery.tsx';
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(
  `const [realProfiles, setRealProfiles] = useState<Profile[]>([]);`,
  `const [focusedId, setFocusedId] = useState<string | null>(null);\n  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);`
);

fs.writeFileSync(filePath, content);
