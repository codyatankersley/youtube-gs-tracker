/* Creates a 2 dimensional array of size (x)x(3) containing the video id, video title and number of views associated with a given video
Returns results to be printed to Google Sheet*/

function getVideoListChannel(channelId, maxNumberVideos, apiKey) {
  var res = UrlFetchApp.fetch("https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=" + channelId + "&maxResults=" + (maxNumberVideos + 1) + "&key=" + apiKey);

  var ytData = getResRaw(res); // HTTP request to JS object

  var channelData = ytData[0]; // highest level
  var videos = ytData[1]; // list of videos from given channel arg channel

  var vidStatsArray = [];

  // Load first 50 results (YouTube max results per page) from channel into array
  vidStatsArray = getVids(videos, vidStatsArray, apiKey);

  // Check if Next Page exists, fetch results using nextPageToken, translate data, load array and repeat
  if (typeof (channelData.nextPageToken) != 'undefined'){
    do {
      var nextPageRes = UrlFetchApp.fetch("https://www.googleapis.com/youtube/v3/search?order=date&part=snippet&channelId=" + channelId + "&maxResults=" + (maxNumberVideos + 1) + "&key=" + apiKey + "&pageToken=" + channelData.nextPageToken);

      var npData = getResRaw(nextPageRes);

      var channelData = npData[0];
      var npVideos = npData[1];

      vidStatsArray = vidStatsArray.concat(getVids(npVideos, vidStatsArray, apiKey));
    }
    while (typeof (channelData.nextPageToken) != 'undefined');
  }
  return vidStatsArray;
}

// Converts HTTP request to Javascript object
function getResRaw(fetchRes){
  var vid = JSON.parse(fetchRes.getContentText());
  var videos = vid.items;
  var dataList = [vid,videos];
  return dataList;
}

// Isolates valuable data, updates list arg
function getVids(vidData, currentList, key){
  var tempArray = currentList

  for (var i = 0; i < vidData.length - 1; i++) {
    var videoid = vidData[i].id.videoId;
    var videotitle = vidData[i].snippet.title;
    var videodescription = vidData[i].snippet.description;
    var videodate = vidData[i].snippet.publishedAt; // date time published
    var statres = UrlFetchApp.fetch('https://www.googleapis.com/youtube/v3/videos?id=' + videoid + '&key=' + key + '&part=snippet,contentDetails,statistics,status');
    var statjson = statres.getContentText();
    var stats = JSON.parse(statjson);
    if (typeof (stats['items'][0]) != 'undefined'){
      tempArray.push([videoid, videotitle, videodate,stats.items[0].statistics.viewCount]);
    }
    else {
      tempArray.push([videoid, videotitle, videodate,]);
    }
    return tempArray;
  }}
