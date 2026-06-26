import { useState } from "react";

import QuestionHeader from "../components/questions/QuestionHeader";
import QuestionStats from "../components/questions/QuestionStats";
import QuestionFilters from "../components/questions/QuestionFilter";
import QuestionTable from "../components/questions/QuestionTable";
import ReflectionPanel from "../components/questions/ReflectionPanel";

function Questions() {
  const [showReflection, setShowReflection] =
    useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [search, setSearch] = useState("");

  const [difficultyFilter, setDifficultyFilter] =
    useState("All");

  console.log(
    "PAGE REFRESH KEY:",
    refreshKey
  );

  return (
    <div className="questions-page">
      <QuestionHeader
        onLogQuestion={() =>
          setShowReflection(true)
        }
      />

      <QuestionStats
        key={refreshKey}
        refreshKey={refreshKey}
      />

      <QuestionFilters
        search={search}
        setSearch={setSearch}
        difficultyFilter={difficultyFilter}
        setDifficultyFilter={
          setDifficultyFilter
        }
      />

      <QuestionTable
        key={refreshKey}
        search={search}
        difficultyFilter={
          difficultyFilter
        }
      />

      {showReflection && (
        <ReflectionPanel
          question={{ isNew: true }}
          onSave={async () => {
            console.log(
              "REFRESHING PAGE"
            );

            setRefreshKey(
              (prev) => prev + 1
            );
          }}
          onClose={() =>
            setShowReflection(false)
          }
        />
      )}
    </div>
  );
}

export default Questions;