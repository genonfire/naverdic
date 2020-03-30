<?php
  $client_id = $_POST['client_id'];
  $client_secret = $_POST['client_secret'];
  $encText = $_POST['text'];
  $postvars = "source=en&target=ko&text=".$encText;
  $url = "https://openapi.naver.com/v1/papago/n2mt";
  $is_post = true;
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL, $url);
  curl_setopt($ch, CURLOPT_POST, $is_post);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch,CURLOPT_POSTFIELDS, $postvars);
  $headers = array();
  $headers[] = "X-Naver-Client-Id: ".$client_id;
  $headers[] = "X-Naver-Client-Secret: ".$client_secret;
  curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
  $response = curl_exec ($ch);
  $status_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close ($ch);

  $json_response = json_decode($response, true);
  $translatedText = $json_response['message']['result']['translatedText'];

  if($status_code == 200) {
    echo $translatedText;
  } else {
    echo "Error:".$response;
  }
?>
