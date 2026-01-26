const baseApiUrl = process.env.VPW_DATA_SERVICE_API_URI;

const options = {
  headers: { "Content-Type": "application/json" },
};

export const getProjects = async () =>
  (await fetch(`${baseApiUrl}/projects`, options)).json();

export const getProject = async (channelId) =>
  (await fetch(`${baseApiUrl}/projects/${channelId}`, options)).json();

export const getLastAction = async (channelId) =>
  (await getProject(channelId)).slice(-1).pop() || null;

export const getLatestStatus = async (channelId) => {
  const actions = await getProject(channelId);
  if (actions.length === 0) return null;

  const last = actions.at(-1);
  const before = actions.at(-2);

  const source =
    last.actionType === "checkin" || actions.length === 1 ? last : before;

  return {
    userId: last.userId,
    username: last.username,
    actionType: last.actionType,
    link: source.link,
    version: source.version,
    comments: source.comments,
    created: source.created,
  };
};

export const isCheckedOut = async (channelId) => {
  const status = await getLatestStatus(channelId);
  return status ? status.actionType === "checkout" : false;
};

export const addAction = async (action) => {
  let response;

  await fetch(`${baseApiUrl}/projects`, {
    method: "post",
    body: JSON.stringify(action),
    headers: { "Content-Type": "application/json" },
  })
    .then((res) => {
      response = res.text();
    })
    .catch((error) => {
      response = error;
    });

  return response;
};

export const removeAction = async (channelId, userId) => {
  let response;
  const lastAction = await getLastAction(channelId);

  if (lastAction?._id) {
    await fetch(
      `${baseApiUrl}/projects/${channelId}?userId=${userId}&actionId=${lastAction?._id}`,
      { method: "delete", headers: { "Content-Type": "application/json" } },
    )
      .then((res) => {
        response = res.text();
      })
      .catch((error) => {
        response = error;
      });
  } else {
    response = "Revert failed.  There are no actions to revert.";
  }

  return response;
};
