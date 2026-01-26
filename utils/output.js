export const printLatestAction = (s) => {
  const preLabel = s.actionType === "checkout" ? "Latest" : "";

  return (
    `**Status**: ${s.actionType === "checkin" ? "CHECKED IN" : "CHECKED OUT"} by <@${s.userId}> \n` +
    `**${preLabel} Link**: <${s.link}> \n` +
    `**${preLabel} Version**: ${s.version} \n` +
    `**${preLabel} Comments**: ${s.comments} \n`
  );
};
