// periods/new ページの初期値を変更する
(function () {
  // Finish_Date を 2100年1月1日に設定
  const yearSelect = document.getElementById("period_finish_datetime_1i");
  if (yearSelect) yearSelect.value = "2100";

  const monthSelect = document.getElementById("period_finish_datetime_2i");
  if (monthSelect) monthSelect.value = "1";

  const daySelect = document.getElementById("period_finish_datetime_3i");
  if (daySelect) daySelect.value = "1";

  // Period_Type を「スキルカレッジ」に設定
  const periodType = document.getElementById("period_period_type");
  if (periodType) periodType.value = "skill_college_period";

  // Department_Type を「スキルカレッジ」に設定
  const departmentType = document.getElementById("period_department_type");
  if (departmentType) departmentType.value = "skill_college_department";

  // Office_Question_Available を「利用不可」に設定
  const officeQuestion = document.getElementById("period_office_question_available");
  if (officeQuestion) officeQuestion.value = "false";
})();
