﻿/// <reference path="point.ts" />

module Maker.Path {

    /**
     * Shortcut to create a new arc path.
     * 
     * @param id The id of the new path.
     * @param origin The origin of the new path, either as a point object, or as an array of numbers.
     * @param radius The radius of the arc.
     * @param startAngle The start angle of the arc.
     * @param endAngle The end angle of the arc.
     * @returns A new POJO representing an arc path.
     */
    export function CreateArc(id: string, origin: IMakerPoint, radius: number, startAngle: number, endAngle: number): IMakerPathArc;
    export function CreateArc(id: string, origin: number[], radius: number, startAngle: number, endAngle: number): IMakerPathArc;
    export function CreateArc(id: string, origin: any, radius: number, startAngle: number, endAngle: number): IMakerPathArc {

        var arc: IMakerPathArc = {
            type: PathType.Arc,
            id: id,
            origin: Point.Ensure(origin),
            radius: radius,
            startAngle: startAngle,
            endAngle: endAngle
        };

        return arc;
    }

    /**
     * Shortcut to create a new circle path.
     * 
     * @param id The id of the new path.
     * @param origin The origin of the new path, either as a point object, or as an array of numbers.
     * @param radius The radius of the circle.
     * @returns A new POJO representing an circle path.
     */
    export function CreateCircle(id: string, origin: IMakerPoint, radius: number): IMakerPathCircle;
    export function CreateCircle(id: string, origin: number[], radius: number): IMakerPathCircle;
    export function CreateCircle(id: string, origin: any, radius: number): IMakerPathCircle {

        var circle: IMakerPathCircle = {
            type: PathType.Circle,
            id: id,
            origin: Point.Ensure(origin),
            radius: radius
        };

        return circle;
    }

    /**
     * Shortcut to create a new line path.
     * 
     * @param id The id of the new path.
     * @param origin The origin of the new path, either as a point object, or as an array of numbers.
     * @param end The end point of the line.
     * @returns A new POJO representing an line path.
     */
    export function CreateLine(id: string, origin: IMakerPoint, end: IMakerPoint): IMakerPathLine;
    export function CreateLine(id: string, origin: number[], end: IMakerPoint): IMakerPathLine;
    export function CreateLine(id: string, origin: IMakerPoint, end: number[]): IMakerPathLine;
    export function CreateLine(id: string, origin: number[], end: number[]): IMakerPathLine;
    export function CreateLine(id: string, origin: any, end: any): IMakerPathLine {

        var line: IMakerPathLine = {
            type: PathType.Line,
            id: id,
            origin: Point.Ensure(origin),
            end: Point.Ensure(end)
        };

        return line;
    }

    /**
     * Create a clone of a path, mirrored on either or both x and y axes.
     * 
     * @param path The path to mirror.
     * @param mirrorX Boolean to mirror on the x axis.
     * @param mirrorY Boolean to mirror on the y axis.
     * @param newId Optional id to assign to the new path.
     * @returns Mirrored path.
     */
    export function Mirror(path: IMakerPath, mirrorX: boolean, mirrorY: boolean, newId?: string): IMakerPath {

        var newPath: IMakerPath = null;
        var origin = Point.Mirror(path.origin, mirrorX, mirrorY);

        var map: IMakerPathFunctionMap = {};

        map[PathType.Line] = function (line: IMakerPathLine) {

            newPath = Path.CreateLine(
                newId || line.id,
                origin,
                Point.Mirror(line.end, mirrorX, mirrorY)
                );
        };

        map[PathType.Circle] = function (circle: IMakerPathCircle) {

            newPath = Path.CreateCircle(
                newId || circle.id,
                origin,
                circle.radius
                );
        };

        map[PathType.Arc] = function (arc: IMakerPathArc) {

            var startAngle = Angle.Mirror(arc.startAngle, mirrorX, mirrorY);
            var endAngle = Angle.Mirror(Angle.ArcEndAnglePastZero(arc), mirrorX, mirrorY);
            var xor = mirrorX != mirrorY;

            newPath = Path.CreateArc(
                newId || arc.id,
                origin,
                arc.radius,
                xor ? endAngle : startAngle,
                xor ? startAngle : endAngle
                );
        };

        var fn = map[path.type];
        if (fn) {
            fn(path);
        }

        return newPath;
    }

    /**
     * Move a path's origin by a relative amount. Note: to move absolute, just set the origin property directly.
     * 
     * @param path The path to move.
     * @param adjust The x & y adjustments, either as a point object, or as an array of numbers.
     * @returns The original path (for chaining).
     */
    export function MoveRelative(path: IMakerPath, adjust: IMakerPoint): IMakerPath;
    export function MoveRelative(path: IMakerPath, adjust: number[]): IMakerPath;
    export function MoveRelative(path: IMakerPath, adjust: any): IMakerPath {

        var map: IMakerPathFunctionMap = {};

        map[PathType.Line] = function (line: IMakerPathLine) {
            line.end = Point.Add(line.end, adjust);
        };

        path.origin = Point.Add(path.origin, adjust);

        var fn = map[path.type];
        if (fn) {
            fn(path);
        }

        return path;
    }

    /**
     * Rotate a path.
     * 
     * @param path The path to rotate.
     * @param angleInDegrees The amount of rotation, in degrees.
     * @param rotationOrigin The center point of rotation.
     * @returns The original path (for chaining).
     */
    export function Rotate(path: IMakerPath, angleInDegrees: number, rotationOrigin: IMakerPoint): IMakerPath {
        if (angleInDegrees == 0) return path;

        var map: IMakerPathFunctionMap = {};

        map[PathType.Line] = function (line: IMakerPathLine) {
            line.end = Point.Rotate(line.end, angleInDegrees, rotationOrigin);
        }

        map[PathType.Arc] = function (arc: IMakerPathArc) {
            arc.startAngle += angleInDegrees;
            arc.endAngle += angleInDegrees;
        }

        path.origin = Point.Rotate(path.origin, angleInDegrees, rotationOrigin);

        var fn = map[path.type];
        if (fn) {
            fn(path);
        }

        return path;
    }

    /**
     * Scale a path.
     * 
     * @param path The path to scale.
     * @param scale The amount of scaling.
     * @returns The original path (for chaining).
     */
    export function Scale(path: IMakerPath, scale: number): IMakerPath {
        if (scale == 1) return path;

        var map: IMakerPathFunctionMap = {};

        map[PathType.Line] = function (line: IMakerPathLine) {
            line.end = Point.Scale(line.end, scale);
        }

        map[PathType.Circle] = function (circle: IMakerPathCircle) {
            circle.radius *= scale;
        }

        map[PathType.Arc] = map[PathType.Circle];

        path.origin = Point.Scale(path.origin, scale);

        var fn = map[path.type];
        if (fn) {
            fn(path);
        }

        return path;
    }

}