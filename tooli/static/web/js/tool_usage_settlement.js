
async function user_credits_settlement(tool_id, CSRFToken) {
    try {
        const formData = new FormData();
        formData.append('tool_id', tool_id);
        const response = await fetch('/web/tool_usage_settlement', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRFToken': CSRFToken
                }
        });
        const result =  await response.json();
        if (response.ok) {
            if (result.code != 200) {
                alert(result.msg);
                return false;
            }
            return true;
        } else if (response.status == 403) {
            alert(result.msg);
            return false;
        } else {
            alert("网络错误，请刷新页面后再尝试")
            return false;
        }
    } catch (error) {
        console.error('发生错误:', error);
        alert("网络错误，请刷新页面后再尝试")
        return false;
    } 
}