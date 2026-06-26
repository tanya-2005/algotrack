type Props = {
  search: string;
  setSearch: React.Dispatch<
    React.SetStateAction<string>
  >;
  difficultyFilter: string;
  setDifficultyFilter: React.Dispatch<
    React.SetStateAction<string>
  >;
};

function QuestionFilters(props: Props) {
  console.log(props);

  const {
    search,
    setSearch,
    difficultyFilter,
    setDifficultyFilter,
  } = props;

  console.log("CURRENT FILTER:", difficultyFilter);
  console.log(
    "setDifficultyFilter:",
    setDifficultyFilter
  );

  return (
    <div>
      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search questions..."
          className="search-input"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>

      <div className="filter-row">
        <button
          className={
            difficultyFilter === "All"
              ? "filter-btn active"
              : "filter-btn"
          }
          onClick={() =>
            setDifficultyFilter("All")
          }
        >
          All
        </button>

        <button
          className={
            difficultyFilter === "Easy"
              ? "filter-btn active"
              : "filter-btn"
          }
          onClick={() =>
            setDifficultyFilter("Easy")
          }
        >
          Easy
        </button>

        <button
          className={
            difficultyFilter === "Medium"
              ? "filter-btn active"
              : "filter-btn"
          }
          onClick={() =>
            setDifficultyFilter("Medium")
          }
        >
          Medium
        </button>

        <button
          className={
            difficultyFilter === "Hard"
              ? "filter-btn active"
              : "filter-btn"
          }
          onClick={() =>
            setDifficultyFilter("Hard")
          }
        >
          Hard
        </button>
      </div>
    </div>
  );
}

export default QuestionFilters;