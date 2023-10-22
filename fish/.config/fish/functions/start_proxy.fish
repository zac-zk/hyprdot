function start_proxy --wraps='export ALL_PROXY=socks5://127.0.0.1:7890' --description 'alias start_proxy export ALL_PROXY=socks5://127.0.0.1:7890'
  export ALL_PROXY=socks5://127.0.0.1:7890 $argv
        
end
