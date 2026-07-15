export function populationRegistrationNote(recordedYear: number | null, isRegionalAggregate = false) {
  if (recordedYear === 1578) {
    const regionalNote = isRegionalAggregate
      ? "南京直隶区未见直接总额，按14府、4直隶州登记值汇总。"
      : "";
    return `万历六年（1578）黄册登记值，不等同于完整实际人口；军户、匠户、灶户等特殊户籍原史料未分列，本项目不另行估算扣除。${regionalNote}`;
  }
  return "黄册体系下的史料登记值，不等同于完整实际人口。";
}
