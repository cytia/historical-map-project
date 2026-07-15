export function populationRegistrationNote(recordedYear: number | null) {
  if (recordedYear === 1578) {
    return "万历六年（1578）黄册体系下的史料登记值；本项目不另行统计军户、匠户、灶户等特殊户籍，原史料未分列，故不对原始总数作估算扣除；不等同于完整实际人口。";
  }
  return "黄册体系下的史料登记值，不等同于完整实际人口。";
}
