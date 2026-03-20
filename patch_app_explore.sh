sed -i 's/import PublicProfile from ".\/components\/PublicProfile";/import PublicProfile from ".\/components\/PublicProfile";\nimport ExploreBuilders from ".\/components\/ExploreBuilders";/g' src/App.tsx

sed -i 's/const \[isProfileRoute, setIsProfileRoute\] = useState(false);/const \[isProfileRoute, setIsProfileRoute\] = useState(false);\n  const \[isExploreRoute, setIsExploreRoute\] = useState(false);/g' src/App.tsx

sed -i 's/} else if (path.startsWith('"'"'\/u\/'"'"')) {/} else if (path === '"'"'\/explore'"'"') {\n      setIsExploreRoute(true);\n    } else if (path.startsWith('"'"'\/u\/'"'"')) {/g' src/App.tsx

sed -i '/if (isProfileRoute) {/i \
  if (isExploreRoute) {\
    return (\
      <SettingsProvider>\
        <CmsProvider>\
          <ExploreBuilders />\
        </CmsProvider>\
      </SettingsProvider>\
    );\
  }\
' src/App.tsx
