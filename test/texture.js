

import Texture2D from '../texture-2d'
import Program from '../program'

var expect  = require( 'expect.js' );

var when = require( 'when' );

var testContext = require( './utils/TestContext' );
var gl = testContext.getContext();

function loadImage( img, src ){
  var def = when.defer()
  img.onload = function(){
    def.resolve( img );
  }
  img.src = src;
  return def.promise;
}

var mireRGB, mireRGBA;
var filltex, filltex16;

describe( "Texture2d", function(){

  before(function() {
    var vert = require( './glsl/filltex.vert')
    var frag = require( './glsl/filltex.frag')
    filltex = new Program( gl );
    filltex.compile( vert, frag, "#define UV_MULT 2.0" );

    filltex16 = new Program( gl );
    filltex16.compile( vert, frag, "#define UV_MULT 17.0" );

    mireRGB  = document.createElement( 'img' );
    mireRGBA = document.createElement( 'img' );
    return when.all( [
      loadImage( mireRGB, 'base/test/assets/mireRGB.png' ),
      loadImage( mireRGBA, 'base/test/assets/mireRGBA.png' ),
    ]);
  });

  after( function(){
    filltex.dispose()
    filltex16.dispose()
  })



  it( "should be exported in nanogl namespace", function(){
    expect( Texture2D ).to.be.ok( );
  });

  it( "creation should leave clean gl state", function(){
    var tex = new Texture2D( gl );
    testContext.assertNoError();
    tex.dispose()
  });


  it( "dispose should leave clean gl state", function(){
    var tex = new Texture2D( gl );
    tex.dispose()
    testContext.assertNoError();
  });


  it( "should load rgb tex", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );
    tex.dispose();
    testContext.assertNoError();
  });


  it( "should load rgba tex", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGBA, true );
    tex.dispose();
    testContext.assertNoError();
  });



  it( "should render rgb tex", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    testContext.drawProgram( filltex );
    testContext.testPixel( 0, 0, 0xFF101010 )
    testContext.testPixel( 0, 16, 0xFFee0000 )

    testContext.assertNoError();
  });


  it( "should render nearest filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    // NEAREST
    tex.setFilter( false, false, false )
    tex.clamp()
    testContext.drawProgram( filltex );
    testContext.testPixel( 16, 3, 0xFFee0000 )
    testContext.testPixel( 48, 3, 0xFF101010 )
  });


  it( "should render linear filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    tex.setFilter( true, false, false )
    tex.clamp()
    testContext.drawProgram( filltex );
    testContext.testPixel( 16, 3, 0xFF955900 )
    testContext.testPixel( 48, 3, 0xFF630A0A )
  });



  it( "should render nearest mip filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    
    gl.generateMipmap( gl.TEXTURE_2D, tex.id );
    tex.setFilter( false, true, false )
    tex.clamp()
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xFF7b4004 )
    testContext.testPixel( 2, 0, 0xFF777700 )
  });


  it( "should render nearest mip linear filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    
    gl.generateMipmap( gl.TEXTURE_2D, tex.id );
    tex.setFilter( false, true, true )
    tex.clamp()
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xFF794209 )
    testContext.testPixel( 2, 0, 0xFF767405 )
  });


  it( "should render linear mip linear filtering", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()

    gl.activeTexture( gl.TEXTURE0 );
    gl.bindTexture( gl.TEXTURE_2D, tex.id );
    gl.uniform1i( filltex.tTex(), 0 );

    
    gl.generateMipmap( gl.TEXTURE_2D, tex.id );
    tex.setFilter( true, true, true )
    tex.clamp()
    testContext.drawProgram( filltex16 );
    testContext.testPixel( 0, 0, 0xff794509 )
    testContext.testPixel( 2, 0, 0xff756c0c )
  });


  it( "should render with program sampler helper", function( ){
    var tex = new Texture2D( gl );
    tex.fromImage( mireRGB, false );

    filltex.bind()
    filltex.tTex( tex );

    testContext.drawProgram( filltex );
    testContext.testPixel( 0, 0, 0xFF101010 )
    testContext.testPixel( 0, 16, 0xFFee0000 )

    testContext.assertNoError();
  });



  it( "@should accept Uint8Array RGB data", function( ){
    var tex = new Texture2D( gl, gl.RGB );
    tex.bind();
    gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );

    var data = new Uint8Array( [
      0x10, 0x10, 0x10,
      0x20, 0x20, 0x20,
      0x30, 0x30, 0x30,
      0x40, 0x40, 0x40
    ]);
    tex.fromData( 2, 2, data );

    testContext.assertNoError();

    filltex.bind()
    filltex.tTex( tex );
    tex.setFilter( false, false, false )

    testContext.drawProgram( filltex );
    testContext.testPixel( 15, 15, 0xFF101010 )
    testContext.testPixel( 16, 15, 0xFF202020 )
    testContext.testPixel( 16, 16, 0xFF404040 )

  });

  it( "should accept Uint8Array RGBA data", function( ){
    var tex = new Texture2D( gl, gl.RGBA );

    var data = new Uint8Array( [
      0x10, 0x10, 0x10, 0x60,
      0x20, 0x20, 0x20, 0x70,
      0x30, 0x30, 0x30, 0x80,
      0x40, 0x40, 0x40, 0x90
    ]);
    tex.fromData( 2, 2, data );

    testContext.assertNoError();

    filltex.bind()
    filltex.tTex( tex );
    tex.setFilter( false, false, false )

    testContext.drawProgram( filltex );
    testContext.testPixel( 15, 15, 0x60101010 )
    testContext.testPixel( 16, 15, 0x70202020 )
    testContext.testPixel( 16, 16, 0x90404040 )

  });


});
