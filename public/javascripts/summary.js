function summarize(activityData){

  totalDuration = 0;
  totalCalories = 0;
  totalUV = 0;
  for(let i=0; i<activityData.length; i++){
    totalDuration += activityData[i].duration;
    totalCalories += activityData[i].calories;
    for(let j=0; j<activityData[i].GPS.length; j++){
      if (activityData[i].GPS[j].uv != 65535){
        totalUV += activityData[i].GPS[j].uv;
      }
    }
  }

  $("#total-duration").html(prettyTime(totalDuration));
  $("#total-calories").html(totalCalories + " Calories");
  $("#total-uv").html(totalUV);
}
