// This is a JavaScript file

$(function(){
    //起動時にmobile backend APIキーを設定
    $.getJSON("setting.json", function(data) {
        NCMB.initialize(
            data.application_key,
            data.client_key
        );
    });
});

//位置情報取得に成功した場合のコールバック
var onSuccess = function(position){
    var current = new CurrentPoint();
    current.distance = CurrentPoint.distance;   //検索範囲の半径を保持する    
    current.geopoint = position.coords;         //位置情報を保存する
    search(current);
};

//位置情報取得に失敗した場合のコールバック
var onError = function(error){
    console.log("現在位置を取得できませんでした");
};

//位置情報取得時に設定するオプション
var option = {
    timeout: 60000   //タイムアウト値(ミリ秒)
};

//現在地を取得する
function find(){
    CurrentPoint.distance = 500; //検索距離を5kmに設定
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
}

//現在地を保持するクラスを作成
function CurrentPoint(){
    geopoint=null;  //端末の位置情報を保持する
    distance=0;     //位置情報検索に利用するための検索距離を指定する
}

//mobile backendから位置情報を検索するメソッド
function search(current){
    //位置情報を検索するクラスのNCMB.Objectを作成する
    var SpotClass = NCMB.Object.extend("Spot");

    //NCMB.Queryを作成
    var query = new NCMB.Query(SpotClass);
    //位置情報をもとに検索する条件を設定
    var geoPoint = new NCMB.GeoPoint(current.geopoint.latitude,current.geopoint.longitude);
    query.withinKilometers("geo", geoPoint, current.distance);

    //mobile backend上のデータ検索を実行する
    query.find({
    success: function(points) {
    ///////////////// ここから変更部分 ////////////////////
        // 検索が成功した場合の処理

        //Google mapの設定
        var mapOptions = {
              //中心地設定
              center: new google.maps.LatLng(current.geopoint.latitude,current.geopoint.longitude),
              //ズーム設定
              zoom: 15,
              //地図のタイプを指定
              mapTypeId: google.maps.MapTypeId.ROADMAP
            };

        //idがmap_canvasのところにGoogle mapを表示
        var map = new google.maps.Map(document.getElementById("map_canvas"),
            mapOptions);

        for (var i = 0; i < points.length; i++){
            var point = points[i];
            console.log("<p>店名：" + point.get("name") + "</p>");

            //位置情報オブジェクトを作成            
            var location = point.get("geo");
            var myLatlng = new google.maps.LatLng(location.latitude,location.longitude);

            //店舗名、位置情報、Google mapオブジェクトを指定してマーカー作成メソッドを呼び出し
            markToMap(point.get("name"), myLatlng, map);
        }
    ///////////////// ここまで変更部分 ////////////////////
    },
    error: function(error) {
        // 検索に失敗した場合の処理
        console.log(error.message);
    }
});
}


function markToMap(name, position, map){
    var marker = new google.maps.Marker({
        position: position,
        title:name
    });
    marker.setMap(map);
    google.maps.event.addListener(marker, 'click', function() {
        var infowindow = new google.maps.InfoWindow({
            content:marker.title
        });
        infowindow.open(map,marker);
    });
}


//スポットを登録する
function saveSpot(){
    //位置情報が取得できたときの処理
    var onSuccess = function (location){
        
        //記事内容を取得
        var title = $("#name").val();
        
        //位置情報オブジェクトを作成
        var geoPoint = new NCMB.GeoPoint(location.coords.latitude, location.coords.longitude);
        
        //Spotクラスのインスタンスを作成★
        var SpotClass = NCMB.Object.extend ("Spot");
        var spot = new SpotClass();
        
        //値を設定★
        spot.set("name",title);
        spot.set("geo" , geoPoint);
        
        //保存を実行★
        spot.save();
        
        //前のページに戻る
        myNavigator.popPage();
    }
    
    //位置情報取得に失敗した場合の処理
    var onError = function(error){
        console.log("error:" + error.message);
    }
    
    var option = {
        timeout: 60000   //タイムアウト値(ミリ秒)
    };
    
    //位置情報を取得
    navigator.geolocation.getCurrentPosition(onSuccess, onError, option);
}
