sed -i '1i import { supabase } from '"'"'../lib/supabase'"'"';' src/components/PeopleDiscovery.tsx

sed -i '/const \[focusedId, setFocusedId\] = useState<string | null>(null);/a \
  const [realProfiles, setRealProfiles] = useState<Profile[]>([]);\
  const [loading, setLoading] = useState(true);\
\
  useEffect(() => {\
    const fetchProfiles = async () => {\
      try {\
        const { data, error } = await supabase\
          .from('"'"'profiles'"'"')\
          .select('"'"'*'"'"')\
          .not('"'"'username'"'"', '"'"'is'"'"', null)\
          .limit(5);\
\
        if (error \&\& error.code !== '"'"'42P01'"'"') throw error;\
\
        if (data \&\& data.length > 0) {\
          const mapped: Profile[] = data.map((p: any) => ({\
            id: p.id,\
            name: p.full_name || p.username,\
            role: p.role || '"'"'Member'"'"',\
            description: p.bio || '"'"'No bio provided.'"'"',\
            avatarUrl: p.avatar_url || '"'"'https://api.dicebear.com/7.x/avataaars/svg?seed='"'"' + p.username,\
            location: p.location || '"'"'Unknown Location'"'"',\
            githubUrl: '"'"'/u/'"'"' + p.username\
          }));\
          setRealProfiles(mapped);\
        } else {\
          setRealProfiles(SAMPLE_PROFILES);\
        }\
      } catch (err) {\
        console.warn('"'"'Could not fetch real profiles'"'"', err);\
        setRealProfiles(SAMPLE_PROFILES);\
      } finally {\
        setLoading(false);\
      }\
    };\
    fetchProfiles();\
  }, []);\
' src/components/PeopleDiscovery.tsx

sed -i 's/profiles={SAMPLE_PROFILES}/profiles={realProfiles.length > 0 ? realProfiles : SAMPLE_PROFILES}/g' src/components/PeopleDiscovery.tsx

sed -i 's/<button className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-\[0_0_20px_rgba(34,211,255,0.2)\] hover:shadow-\[0_0_30px_rgba(34,211,255,0.4)\] transition-all hover:scale-105 group flex items-center gap-2">/<a href="\/explore" className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-xl shadow-\[0_0_20px_rgba(34,211,255,0.2)\] hover:shadow-\[0_0_30px_rgba(34,211,255,0.4)\] transition-all hover:scale-105 group flex items-center gap-2">/g' src/components/PeopleDiscovery.tsx

sed -i 's/Create your profile\n            <\/button>/Explore All Builders\n            <\/a>/g' src/components/PeopleDiscovery.tsx
