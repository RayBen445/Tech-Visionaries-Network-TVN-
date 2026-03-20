# Let's clean up the top of the file since it has duplicate imports
sed -i '1,6d' src/components/PeopleDiscovery.tsx
sed -i '1i import React, { useState, useEffect } from '"'"'react'"'"';\nimport { supabase } from '"'"'../lib/supabase'"'"';' src/components/PeopleDiscovery.tsx
