/**
 * Created by song.chl on 2016/11/25.
 */
/*author:chenglusong
  time:2016-11-25 11:31:36
  function: 根据用户的点选，推测出
* */
function get_next_button_xpath(element_path) {
    var xpath = '';
    var tmp= '';
    var max_length = -1;
    var path_array =  element_path.split('/');
    var length = path_array.length;
    for(var i = 0; i < 4; i ++)
    {
        var index;
        var location;
        var ii;
        location = length - i - 1;
        tmp = path_array[location]
        index = path_array[location].indexOf('[');
        if(index != -1)
        {
            path_array[location] = path_array[location].substring(0,index)
        }
        var path = path_array.join("/")
        var next_buttons = $("#scraped-doc-iframe").contents().xpath(path);
        if(next_buttons.length > max_length){
            max_length = next_buttons.length;
            ii = length - i - 1
            path = path_array.join("/")
            xpath = path
        }else{
            path_array[location] = tmp
        }



    }
    path_array[ii] = path_array[ii] + '*'
    return path_array.join('/');
}