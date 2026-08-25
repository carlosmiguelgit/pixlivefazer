$i = 0
while ($i -lt 10) {
  try {
    $r = Invoke-RestMethod 'http://127.0.0.1:4040/api/tunnels' -ErrorAction Stop
    $u = $r.tunnels[0].public_url
    if ($u) {
      Write-Output ($u + '/nubank')
      exit 0
    }
  } catch {}
  Start-Sleep 2
  $i++
}
exit 1